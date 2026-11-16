// Brings a candidate into the catalog so a reviewer can decide on it. Candidates arrive two
// ways: agents offer them to the marketplace's public registry (packages/receta-market) with
// its submit_asset tool, and the receta-skills script or a person opens an issue on
// ontology-io/receta.
//
//   bun scripts/intake.ts --list              the registry's review list, most voted first
//   bun scripts/intake.ts --market <id>       a registry submission (RECETA_MARKET_URL)
//   bun scripts/intake.ts 123                 issue #123, read with gh
//   bun scripts/intake.ts --file body.md      an issue body saved to a file
//
// It writes the file to src/<category>/<name>.ts, runs the full check on it, and lists the
// closest assets already in the catalog. It sends nothing; it prints what accepting and
// declining take.
import { existsSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import { join, relative } from 'node:path'
import { oneOf } from '@ontologyio/receta/predicate'
import { err, flatMap, isErr, map, mapErr, ok, parseJSON, type Result, tryCatchAsync } from '@ontologyio/receta/result'
import * as R from 'remeda'
import {
  type Candidate,
  findAsset,
  loadCatalog,
  parseCandidate,
  REPO,
  search,
} from '../../../plugins/receta-skills/skills/assets/scripts/assets.ts'
import { CATEGORIES, ROOT, readAsset } from './assets'

/** Where a candidate came from, which decides how it is closed. */
type Origin = { readonly kind: 'market'; readonly id: string } | { readonly kind: 'issue'; readonly ref: string } | { readonly kind: 'file' }

type Source = { readonly candidate: Candidate; readonly origin: Origin }

type MarketSubmission = {
  readonly id: string
  readonly name: string
  readonly category: string
  readonly why: string
  readonly adaptedFrom: string
  readonly code: string
  readonly status: string
}

const isCategory = oneOf<string>(CATEGORIES)

const fail = (message: string): number => {
  console.error(message)
  return 1
}

const flag = (args: readonly string[], name: string): string | undefined => {
  const at = R.findIndex(args, (arg) => arg === `--${name}`)
  return at < 0 ? undefined : args[at + 1]
}

const marketUrl = (): Result<string, string> => {
  const url = process.env['RECETA_MARKET_URL']?.replace(/\/(mcp)?$/, '')
  return url === undefined || url === '' ? err('Set RECETA_MARKET_URL to the marketplace, like https://receta.dev/market') : ok(url)
}

const fetchJson = async <T>(url: string): Promise<Result<T, string>> =>
  R.pipe(
    await tryCatchAsync(async () => {
      const response = await fetch(url)
      if (!response.ok) throw new Error(`${url} answered ${response.status}`)
      return response.text()
    }),
    mapErr((error) => String(error)),
    flatMap((text) => R.pipe(parseJSON<T>(text), mapErr(() => `${url} answered something other than JSON`))),
  )

const fromCandidateBody = (body: string, origin: Origin): Result<Source, string> => {
  const parsed = parseCandidate(body)
  return parsed.ok ? ok({ candidate: parsed.candidate, origin }) : err(`Not a candidate: ${parsed.problem}`)
}

const readIssue = async (reference: string, repo: string): Promise<Result<Source, string>> => {
  const child = Bun.spawn(['gh', 'issue', 'view', reference, '--repo', repo, '--json', 'body,number'], {
    stdout: 'pipe',
    stderr: 'pipe',
  })
  const output = await new Response(child.stdout).text()
  const errors = await new Response(child.stderr).text()
  if ((await child.exited) !== 0) return err(`gh issue view ${reference}: ${errors.trim()}`)
  return R.pipe(
    parseJSON<{ readonly body: string; readonly number: number }>(output),
    mapErr(() => `gh answered something other than an issue: ${output.slice(0, 200)}`),
    flatMap((issue) => fromCandidateBody(issue.body, { kind: 'issue', ref: `#${issue.number}` })),
  )
}

const readMarket = async (id: string): Promise<Result<Source, string>> => {
  const base = marketUrl()
  if (isErr(base)) return base
  return R.pipe(
    await fetchJson<MarketSubmission>(`${base.value}/api/submissions/${id}`),
    flatMap((submission) =>
      submission.status === 'candidate'
        ? ok(submission)
        : err(`candidate/${id} was already ${submission.status}.`),
    ),
    map((submission) => ({
      candidate: {
        category: submission.category,
        name: submission.name,
        why: submission.why,
        from: submission.adaptedFrom,
        code: submission.code,
      },
      origin: { kind: 'market', id: submission.id } as const,
    })),
  )
}

const readSource = async (args: readonly string[]): Promise<Result<Source, string>> => {
  const marketId = flag(args, 'market')
  if (marketId !== undefined) return readMarket(marketId)
  const file = flag(args, 'file')
  if (file !== undefined) {
    return R.pipe(
      await tryCatchAsync(() => readFile(file, 'utf8')),
      mapErr(() => `Can't read ${file}`),
      flatMap((body) => fromCandidateBody(body, { kind: 'file' })),
    )
  }
  const reference = R.find(args, (arg) => !arg.startsWith('--'))
  return reference === undefined
    ? err('Usage: bun scripts/intake.ts --list | --market <id> | <issue number or URL> | --file <body.md>')
    : readIssue(reference, process.env['RECETA_ASSETS_REPO'] ?? REPO)
}

/** A candidate the catalog can take: a known category and a name no asset uses yet. */
const admissible = async (candidate: Candidate): Promise<Result<Candidate, string>> => {
  const catalog = await loadCatalog({ catalog: ROOT })
  const taken = findAsset(catalog.assets, candidate.name)
  if (!isCategory(candidate.category)) {
    return err(`Unknown category "${candidate.category}". Pick one of: ${R.join(CATEGORIES, ', ')}`)
  }
  if (taken !== undefined) {
    return err(`${taken.category}/${taken.name} already exists. Ask for a name that says what differs.`)
  }
  return existsSync(join(ROOT, 'src', candidate.category, `${candidate.name}.ts`))
    ? err(`src/${candidate.category}/${candidate.name}.ts exists but isn't in the catalog: run bun scripts/catalog.ts`)
    : ok(candidate)
}

const runCheck = async (name: string): Promise<number> =>
  Bun.spawn(['bun', 'scripts/check.ts', name], { cwd: ROOT, stdout: 'inherit', stderr: 'inherit' }).exited

const closestTo = async (path: string, name: string): Promise<readonly string[]> => {
  const [catalog, asset] = [await loadCatalog({ catalog: ROOT }), await readAsset(path)]
  return R.pipe(
    search(catalog.assets, R.join([name, asset.doc.summary, ...asset.doc.tags], ' '), { limit: 5 }),
    R.map((hit) => `  ${hit.asset.category}/${hit.asset.name}: ${hit.asset.summary}`),
  )
}

/** The commands that record a decision in the registry, with the admin token. */
const decideCommand = (id: string, status: 'accepted' | 'declined', note: string): string =>
  `  curl -X POST "$RECETA_MARKET_URL/admin/decide" -H "Authorization: Bearer $(cat ~/.config/receta-market/admin-token)" -d '{"id":"${id}","status":"${status}","note":"${note}"}'`

const nextSteps = (candidate: Candidate, path: string, origin: Origin, passed: boolean): string => {
  const index = `src/${candidate.category}/index.ts`
  const reference =
    origin.kind === 'issue' ? ` -m "Closes ${origin.ref}"` : origin.kind === 'market' ? ` -m "From candidate/${origin.id} in the registry"` : ''
  return R.join(
    [
      passed ? 'The check passed.' : 'The check found problems. Fix them, or decline with the reason.',
      '',
      'Accept:',
      '  bun scripts/catalog.ts',
      `  git add ${path} ${index} catalog.json CATALOG.md`,
      `  git commit -m "feat(assets): add ${candidate.category}/${candidate.name}"${reference}`,
      ...(origin.kind === 'market'
        ? [decideCommand(origin.id, 'accepted', 'In the next release'), '  and after the release, deploy the marketplace and POST /admin/reindex']
        : []),
      '',
      'Decline:',
      `  rm ${path}`,
      origin.kind === 'market'
        ? decideCommand(origin.id, 'declined', 'the reason: a near-duplicate of …, too specific to one project, …')
        : `  then close ${origin.kind === 'issue' ? origin.ref : 'the issue'} with the reason: a near-duplicate, too specific to one project, …`,
    ],
    '\n',
  )
}

type ListedCandidate = {
  readonly id: string
  readonly name: string
  readonly category: string
  readonly summary: string
  readonly votes: number
  readonly worked: number
  readonly failed: number
}

const list = async (): Promise<number> => {
  const base = marketUrl()
  if (isErr(base)) return fail(base.error)
  const listed = await fetchJson<readonly ListedCandidate[]>(`${base.value}/api/candidates`)
  if (isErr(listed)) return fail(listed.error)
  if (listed.value.length === 0) return R.pipe(console.log('Nothing waiting for review.'), () => 0)
  R.forEach(listed.value, (candidate) =>
    console.log(
      `${candidate.id}  ${candidate.category}/${candidate.name}  votes ${candidate.votes}, agents worked ${candidate.worked} failed ${candidate.failed}\n    ${candidate.summary}`,
    ),
  )
  return 0
}

const intake = async (args: readonly string[]): Promise<number> => {
  if (args.includes('--list')) return list()
  const source = await readSource(args)
  if (isErr(source)) return fail(source.error)
  const candidate = await admissible(source.value.candidate)
  if (isErr(candidate)) return fail(candidate.error)

  const { category, name, why, from, code } = candidate.value
  const absolute = join(ROOT, 'src', category, `${name}.ts`)
  const path = relative(ROOT, absolute)
  await writeFile(absolute, code)
  const origin = source.value.origin
  console.log(`${origin.kind === 'market' ? `candidate/${origin.id}` : origin.kind === 'issue' ? origin.ref : 'Candidate'} → ${path}`)
  console.log(`Why: ${why || '(not given)'}`)
  if (from !== '') console.log(`Adapted from: ${from}`)
  console.log('')

  const passed = (await runCheck(name)) === 0
  console.log(`\nClosest assets already in the catalog:\n${R.join(await closestTo(absolute, name), '\n')}\n`)
  console.log(nextSteps(candidate.value, path, origin, passed))
  return passed ? 0 : 1
}

process.exit(await intake(process.argv.slice(2)))
