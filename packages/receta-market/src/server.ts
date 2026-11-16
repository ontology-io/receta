// The MCP server agents talk to. Every tool reads; offering a function comes later, once the
// registry's rules are settled.
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import * as R from 'remeda'
import { z } from 'zod'
import { findAsset } from '../../../plugins/receta-skills/skills/assets/scripts/core.ts'
import { type Bundle, type BundledAsset, keyOf } from './bundle'
import { rank } from './search'
import type { Vectors } from './vectors'

export type ServerDeps = { readonly bundle: Bundle; readonly vectors?: Vectors | undefined }

const INSTRUCTIONS = `receta-assets is a catalog of small TypeScript functions built from Receta and Remeda, each one
file whose comment is its whole manual, with examples that are checked on every change.

Before you write a helper (a parser, a retry, a cache, a dedupe, a formatter, a validator), call
search_assets with the job in words, and the input and output types when you know them. Then:
- an asset does the job: get_asset and copy the file unchanged, comment included
- one is close, differing in one policy: copy it, change only that, and name it by what differs
- nothing is close: write a new function to the rules in authoring_guide
related_assets finds an asset's variants; browse walks the categories.

A copied file imports remeda and @ontologyio/receta: ask the person before adding them to a project.`

const READ_ONLY = { readOnlyHint: true, openWorldHint: false } as const

const text = (body: string) => ({ content: [{ type: 'text' as const, text: body }] })

const signatureLine = (asset: BundledAsset): string => {
  const inputs = R.join(R.map(asset.inputs ?? [], (input) => `${input.name}: ${input.type}`), ', ')
  return `takes (${inputs}), returns ${asset.output ?? 'unknown'}`
}

const describeHit = (asset: BundledAsset, index: number, score?: number): string =>
  R.join(
    [
      `${index + 1}. ${keyOf(asset)}${score === undefined ? '' : `  (score ${score.toFixed(2)})`}`,
      `   ${asset.summary}`,
      `   Use when: ${asset.useWhen}`,
      `   ${signatureLine(asset)}`,
      `   Built from: ${R.join(R.filter(asset.composes, (name) => !name.startsWith('R.')), ', ')}`,
    ],
    '\n',
  )

const notFound = (bundle: Bundle, name: string) =>
  text(`No asset named "${name}" among ${bundle.count}. Use search_assets, or browse a category.`)

export const createServer = ({ bundle, vectors }: ServerDeps): McpServer => {
  const server = new McpServer({ name: 'receta-assets', version: '0.1.0' }, { instructions: INSTRUCTIONS })
  const categories = R.map(bundle.categories, R.prop('name'))
  const category = z.enum(categories as [string, ...string[]])

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
      },
      annotations: READ_ONLY,
    },
    async (query) => {
      const ranked = await rank(bundle.assets, query, vectors)
      if (ranked.length === 0) {
        return text('Nothing matched. Try other words, or browse a category. If nothing fits, see authoring_guide.')
      }
      const note = ranked[0]?.semantic === false ? '\n(Ranked by words only: the vector index was unavailable.)' : ''
      return text(`${R.join(ranked.map((hit, index) => describeHit(hit.asset, index, hit.score)), '\n\n')}${note}`)
    },
  )

  server.registerTool(
    'get_asset',
    {
      title: 'Read an asset',
      description: 'The full file of an asset, comment included, ready to copy into a project unchanged.',
      inputSchema: { name: z.string().describe('The asset, like "parsePort" or "parse/parsePort"') },
      annotations: READ_ONLY,
    },
    async ({ name }) => {
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
        return text(
          `${bundle.count} assets:\n${R.join(
            R.map(bundle.categories, (info) => `- ${info.name} (${info.count}): ${info.about}`),
            '\n',
          )}`,
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

  return server
}
