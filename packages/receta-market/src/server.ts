// The MCP server agents talk to. Reading needs nothing; offering a function and reporting
// how one worked need the registry, and offering also needs the person's agreement.
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { isErr, tryCatchAsync } from '@ontologyio/receta/result'
import * as R from 'remeda'
import { z } from 'zod'
import { findAsset } from '../../../plugins/receta-skills/skills/assets/scripts/core.ts'
import { type Bundle, type BundledAsset, keyOf } from './bundle'
import { listingOf, MAX_FILE_LENGTH, toSubmission } from './candidates'
import { candidateKey, NO_TALLY, type Registry, type Tally } from './registry'
import { type Ranked, rank } from './search'
import { entriesFor, keyFor, type Listing, type Vectors } from './vectors'

/** What the server knows about the request it answers. */
export type Caller = {
  /** A salted hash of the caller's address, for rate limits. */
  readonly sender: string
  /** The person opted out of sharing, through the plugin's header. */
  readonly shareOff: boolean
  /** Where the registry pages live, for links. */
  readonly registryUrl: string
}

export type ServerDeps = {
  readonly bundle: Bundle
  readonly vectors?: Vectors | undefined
  readonly registry?: Registry | undefined
  readonly caller?: Caller | undefined
}

const SUBMISSIONS_PER_DAY = 10
const REPORTS_PER_DAY = 200
const CANDIDATES_SEARCHED = 300
/** Votes and reports can lift a result by at most this share, so relevance still decides. */
const POPULARITY = 0.1

const INSTRUCTIONS = `receta-assets is a catalog of small TypeScript functions built from Receta and Remeda, each one
file whose comment is its whole manual, with examples that are checked on every change.

Before you write a helper (a parser, a retry, a cache, a dedupe, a formatter, a validator), call
search_assets with the job in words, and the input and output types when you know them. Then:
- an asset does the job: get_asset and copy the file unchanged, comment included
- one is close, differing in one policy: copy it, change only that, and name it by what differs
- nothing is close: write a new function to the rules in authoring_guide
related_assets finds an asset's variants; browse walks the categories.

After you use an asset, call report_use with whether it worked. It ranks what works higher.

When you wrote a new function or a variant, you may offer it with submit_asset, but only after the
person has seen the exact file and agreed that it becomes public at once. Make it generic first:
no project names, business data, internal URLs or secrets. Never offer an unchanged copy or code
that only wires assets into the project.

A copied file imports remeda and @ontologyio/receta: ask the person before adding them to a project.`

const READ_ONLY = { readOnlyHint: true, openWorldHint: false } as const

const text = (body: string) => ({ content: [{ type: 'text' as const, text: body }] })

const refusal = (body: string) => ({ ...text(body), isError: true })

const signatureLine = (asset: BundledAsset): string => {
  const inputs = R.join(R.map(asset.inputs ?? [], (input) => `${input.name}: ${input.type}`), ', ')
  return `takes (${inputs}), returns ${asset.output ?? 'unknown'}`
}

const tallyLine = (tally: Tally): string =>
  tally.votes + tally.worked + tally.failed === 0
    ? ''
    : `\n   People's votes ${tally.votes}; agents report it worked ${tally.worked} times, failed ${tally.failed}`

const describeHit = (listing: Listing, index: number, scored?: Ranked, tally: Tally = NO_TALLY): string =>
  R.join(
    [
      `${index + 1}. ${keyFor(listing)}${listing.candidateId === undefined ? '' : `  UNREVIEWED: ${listing.category}/${listing.name}, nobody has checked this code`}${
        scored === undefined
          ? ''
          : `  (score ${scored.score.toFixed(2)}: meaning ${scored.parts.vectors.toFixed(2)}, words ${scored.parts.words.toFixed(2)})`
      }`,
      `   ${listing.summary}`,
      `   ${listing.candidateId === undefined ? 'Use when' : 'Offered because'}: ${listing.useWhen}`,
      `   ${signatureLine(listing)}`,
      ...(listing.composes.length === 0
        ? []
        : [`   Built from: ${R.join(R.filter(listing.composes, (name) => !name.startsWith('R.')), ', ')}`]),
    ],
    '\n',
  ) + tallyLine(tally)

/** Lifts results people voted for and agents report as working, by at most POPULARITY. */
const popularity = (tally: Tally): number => 1 + POPULARITY * Math.min(1, Math.log10(1 + tally.votes + tally.worked / 4) / 2)

const notFound = (bundle: Bundle, name: string) =>
  text(`No asset named "${name}" among ${bundle.count}. Use search_assets, or browse a category.`)

export const createServer = ({ bundle, vectors, registry, caller }: ServerDeps): McpServer => {
  const server = new McpServer({ name: 'receta-assets', version: '0.2.0' }, { instructions: INSTRUCTIONS })
  const categories = R.map(bundle.categories, R.prop('name'))
  const category = z.enum(categories as [string, ...string[]])
  const tallies = async (keys: readonly string[]): Promise<ReadonlyMap<string, Tally>> =>
    registry === undefined ? new Map() : registry.tallies(keys)

  server.registerTool(
    'search_assets',
    {
      title: 'Search receta-assets',
      description:
        'Find checked functions for a job before writing one. Describe the job in plain words; add the input and output types when you know them. Returns the best matches with when to use each and its signature.',
      inputSchema: {
        job: z.string().min(3).describe('What the function should do, like "dedupe events by id, keep the newest"'),
        input: z.string().optional().describe('What it takes, like "Event[]" or "a string from an env var"'),
        output: z.string().optional().describe('What it returns, like "Result<number>" or "the list without duplicates"'),
        category: category.optional().describe('Search one category only'),
        limit: z.number().int().min(1).max(20).optional().describe('How many results, 8 by default'),
        include_candidates: z
          .boolean()
          .optional()
          .describe('Also return unreviewed submissions, marked UNREVIEWED. Nobody has checked their code; read it before using it.'),
      },
      annotations: READ_ONLY,
    },
    async ({ include_candidates, limit, ...query }) => {
      const candidates =
        include_candidates === true && registry !== undefined
          ? R.map(await registry.candidates(CANDIDATES_SEARCHED), listingOf)
          : []
      const wanted = limit ?? 8
      const ranked = await rank([...bundle.assets, ...candidates], {
        ...query,
        limit: wanted * 2,
        statuses: candidates.length > 0 ? ['reviewed', 'candidate'] : ['reviewed'],
      }, vectors)
      if (ranked.length === 0) {
        return text('Nothing matched. Try other words, or browse a category. If nothing fits, see authoring_guide.')
      }
      const counts = await tallies(R.map(ranked, (hit) => keyFor(hit.asset)))
      const best = R.pipe(
        ranked,
        R.map((hit) => {
          const tally = counts.get(keyFor(hit.asset)) ?? NO_TALLY
          return { hit: { ...hit, score: hit.score * popularity(tally) }, tally }
        }),
        R.sortBy([({ hit }) => hit.score, 'desc']),
        R.take(wanted),
      )
      const note = ranked[0]?.semantic === false ? '\n(Ranked by words only: the vector index was unavailable.)' : ''
      // Say what the guard held back, so an agent knows candidates exist without seeing them.
      const heldBack =
        include_candidates !== true && registry !== undefined && (await registry.candidates(1)).length > 0
          ? '\n\nunreviewed submissions left out; ask with include_candidates: true'
          : ''
      return text(
        `${R.join(best.map(({ hit, tally }, index) => describeHit(hit.asset, index, hit, tally)), '\n\n')}${note}${heldBack}`,
      )
    },
  )

  server.registerTool(
    'get_asset',
    {
      title: 'Read an asset',
      description:
        'The full file of an asset, comment included, ready to copy into a project unchanged. Also reads a submission by its candidate/<id> key.',
      inputSchema: { name: z.string().describe('The asset, like "parsePort" or "parse/parsePort", or "candidate/<id>"') },
      annotations: READ_ONLY,
    },
    async ({ name }) => {
      const candidateId = /^candidate\/(\w+)$/.exec(name)?.[1]
      if (candidateId !== undefined && registry !== undefined) {
        const submission = await registry.find(candidateId)
        if (submission === undefined) return text(`No submission ${name}.`)
        return text(
          R.join(
            [
              `${name}: ${submission.category}/${submission.name}, ${submission.status === 'candidate' ? 'UNREVIEWED. Nobody has checked this code; read all of it before using it' : submission.status}.`,
              '',
              '```ts',
              submission.code.trimEnd(),
              '```',
            ],
            '\n',
          ),
        )
      }
      const asset = findAsset(bundle.assets, name) as BundledAsset | undefined
      if (asset === undefined) return notFound(bundle, name)
      return text(
        R.join(
          [
            `${keyOf(asset)}: copy this file as it is. It imports remeda and @ontologyio/receta.`,
            `Installed package instead: ${asset.import}`,
            '',
            '```ts',
            asset.source.trimEnd(),
            '```',
          ],
          '\n',
        ),
      )
    },
  )

  server.registerTool(
    'browse',
    {
      title: 'Browse the catalog',
      description: 'Without a category: every category with what it holds. With one: every asset in it, one line each.',
      inputSchema: { category: category.optional() },
      annotations: READ_ONLY,
    },
    async ({ category: chosen }) => {
      if (chosen === undefined) {
        const registryLine =
          caller === undefined ? '' : `\n\nUnreviewed submissions and votes: ${caller.registryUrl}`
        return text(
          `${bundle.count} assets:\n${R.join(
            R.map(bundle.categories, (info) => `- ${info.name} (${info.count}): ${info.about}`),
            '\n',
          )}${registryLine}`,
        )
      }
      const inCategory = R.filter(bundle.assets, (asset) => asset.category === chosen)
      return text(R.join(R.map(inCategory, (asset) => `- ${asset.name}: ${asset.summary}`), '\n'))
    },
  )

  server.registerTool(
    'related_assets',
    {
      title: 'Find related assets',
      description:
        "An asset's nearest neighbours by what they do: its variants and siblings. Use it to find the closest function to adapt.",
      inputSchema: {
        name: z.string().describe('The asset, like "dedupeByKeepFirst"'),
        limit: z.number().int().min(1).max(20).optional(),
      },
      annotations: READ_ONLY,
    },
    async ({ name, limit }) => {
      const asset = findAsset(bundle.assets, name) as BundledAsset | undefined
      if (asset === undefined) return notFound(bundle, name)
      const job = `${asset.summary} ${R.join(asset.tags, ' ')}`
      const ranked = await rank(bundle.assets, { job, limit: (limit ?? 6) + 1 }, vectors)
      const others = R.pipe(
        ranked,
        R.filter((hit) => keyOf(hit.asset) !== keyOf(asset)),
        R.take(limit ?? 6),
      )
      return text(R.join(others.map((hit, index) => describeHit(hit.asset, index)), '\n\n'))
    },
  )

  server.registerTool(
    'authoring_guide',
    {
      title: 'How to write an asset',
      description:
        'The rules a new function follows: one function per file, Receta first, and the comment with "Use when", examples and tags.',
      annotations: READ_ONLY,
    },
    async () =>
      text(
        `In a project, the rules for the function and its comment apply as written. The file goes in the project's helper folder; the commands below belong to the catalog's own repository.\n\n${bundle.authoring}`,
      ),
  )

  if (registry === undefined || caller === undefined) return server

  server.registerTool(
    'report_use',
    {
      title: 'Report how an asset worked',
      description:
        'After using an asset or a submission in a project, say whether it did the job. Reports are counted apart from people\'s votes and lift what works in search.',
      inputSchema: {
        name: z.string().describe('The asset, like "parse/parsePort", or "candidate/<id>"'),
        worked: z.boolean().describe('True when it did the job as its comment says'),
      },
      annotations: { readOnlyHint: false, openWorldHint: false, idempotentHint: false },
    },
    async ({ name, worked }) => {
      const candidateId = /^candidate\/(\w+)$/.exec(name)?.[1]
      const asset = candidateId === undefined ? (findAsset(bundle.assets, name) as BundledAsset | undefined) : undefined
      const submission = candidateId === undefined ? undefined : await registry.find(candidateId)
      const item = asset !== undefined ? keyOf(asset) : submission !== undefined ? candidateKey(submission.id) : undefined
      if (item === undefined) return refusal(`Nothing named "${name}" to report on.`)
      if ((await registry.reportedSince(caller.sender, new Date(Date.now() - 86_400_000))) >= REPORTS_PER_DAY) {
        return refusal('Too many reports from this address today. Try again tomorrow.')
      }
      await registry.reportUse(item, worked, caller.sender)
      return text(`Recorded: ${item} ${worked ? 'worked' : 'did not work'}. Thank you.`)
    },
  )

  server.registerTool(
    'submit_asset',
    {
      title: 'Offer a function to receta-assets',
      description:
        'Offers a new function or variant to the public registry, where it is listed as unreviewed at once and people vote on it. Only call this after the person saw the exact file and agreed it becomes public.',
      inputSchema: {
        file: z.string().min(50).max(MAX_FILE_LENGTH).describe('The whole file: one exported function with its comment'),
        category: category.describe('Where it belongs'),
        why: z.string().min(10).max(500).describe('The job it does, in one or two sentences'),
        adapted_from: z.string().optional().describe('The asset it varies, like "text/maskCardNumber"'),
        person_agreed: z
          .literal(true)
          .describe('True only when the person saw this exact file and agreed that it becomes public'),
      },
      annotations: { readOnlyHint: false, openWorldHint: true, idempotentHint: false },
    },
    async ({ file, category: chosen, why, adapted_from }) => {
      if (caller.shareOff) {
        return refusal('Sharing is off for this person (RECETA_ASSETS_SHARE). Nothing was stored.')
      }
      if ((await registry.submittedSince(caller.sender, new Date(Date.now() - 86_400_000))) >= SUBMISSIONS_PER_DAY) {
        return refusal(`At most ${SUBMISSIONS_PER_DAY} submissions a day from one address. Try again tomorrow.`)
      }
      if (adapted_from !== undefined && findAsset(bundle.assets, adapted_from) === undefined) {
        return refusal(`adapted_from: no asset named "${adapted_from}".`)
      }
      const shaped = toSubmission(
        { file, category: chosen, why, adaptedFrom: adapted_from ?? '' },
        bundle,
        caller.sender,
      )
      if (isErr(shaped)) return refusal(`Not stored (${shaped.error.code}):\n- ${R.join(shaped.error.reasons, '\n- ')}`)
      const duplicate = R.find(
        await registry.candidates(CANDIDATES_SEARCHED),
        (other) => other.name === shaped.value.name && other.category === shaped.value.category,
      )
      if (duplicate !== undefined) {
        return refusal(
          `${chosen}/${shaped.value.name} is already offered as candidate/${duplicate.id}. Vote for it at ${caller.registryUrl}/c/${duplicate.id}, or rename yours by what differs.`,
        )
      }
      const stored = await registry.submit(shaped.value)
      const listing = listingOf(stored)
      // The registry has it either way; a failed embedding only keeps it out of search for now.
      const indexed = await tryCatchAsync(async () => {
        if (vectors === undefined) return
        const entries = entriesFor(listing, 'candidate')
        const values = await vectors.embedEntries(R.map(entries, R.prop('text')))
        await vectors.upsert(R.zipWith(entries, values, (entry, vector) => ({ id: entry.id, values: vector, metadata: entry.metadata })))
      })
      const closest = await rank(bundle.assets, { job: `${stored.summary} ${R.join(stored.tags, ' ')}`, limit: 3 }, vectors)
      return text(
        R.join(
          [
            `Stored as ${keyFor(listing)}, listed as unreviewed at ${caller.registryUrl}/c/${stored.id}.`,
            'People can now vote on it; the Receta team reviews the most wanted first.',
            isErr(indexed)
              ? 'Indexing it failed for now; it shows in search after the next reindex.'
              : 'It shows in search_assets with include_candidates in a minute or two, once the index has taken it in.',
            '',
            'Closest assets already in the catalog:',
            ...R.map(closest, (hit) => `- ${keyOf(hit.asset)}: ${hit.asset.summary}`),
          ],
          '\n',
        ),
      )
    },
  )

  return server
}
