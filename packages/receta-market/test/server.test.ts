// Drives the server through a real MCP client, with a fake vector index: each text becomes a
// hashed bag of its words, so similar wording gives similar vectors without Workers AI.
import { describe, expect, it } from 'bun:test'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
import * as R from 'remeda'
import { tokenize } from '../../../plugins/receta-skills/skills/assets/scripts/core.ts'
import { bundle } from '../src/bundle'
import { createServer } from '../src/server'
import { type Field, FIELDS, fieldText, type Vectors, vectorId } from '../src/vectors'

const DIMENSIONS = 256

const hashOf = (word: string): number =>
  R.reduce([...word], (hash, char) => (hash * 31 + char.charCodeAt(0)) % DIMENSIONS, 7)

const fakeEmbed = (text: string): readonly number[] => {
  const perSlot = R.countBy(tokenize(text), (word) => String(hashOf(word)))
  const counts = R.times(DIMENSIONS, (slot): number => perSlot[String(slot)] ?? 0)
  const length = Math.sqrt(R.sumBy(counts, (value) => value * value)) || 1
  return R.map(counts, (value) => value / length)
}

const cosine = (a: readonly number[], b: readonly number[]): number =>
  R.sumBy(R.zip(a, b), ([x, y]) => x * y)

const stored = R.flatMap(bundle.assets, (asset) =>
  R.map(FIELDS, (field) => ({ id: vectorId(asset, field), field, vector: fakeEmbed(fieldText(asset, field)) })),
)

const fakeVectors: Vectors = {
  embed: async (texts) => R.map(texts, fakeEmbed),
  query: async (vector, field: Field, topK) =>
    R.pipe(
      stored,
      R.filter((item) => item.field === field),
      R.map((item) => ({ id: item.id, score: cosine(vector, item.vector) })),
      R.sortBy([R.prop('score'), 'desc']),
      R.take(topK),
    ),
}

const failingVectors: Vectors = {
  embed: async () => {
    throw new Error('index unavailable')
  },
  query: async () => [],
}

const connect = async (vectors: Vectors | undefined): Promise<Client> => {
  const [clientSide, serverSide] = InMemoryTransport.createLinkedPair()
  await createServer({ bundle, vectors }).connect(serverSide)
  const client = new Client({ name: 'test', version: '0' })
  await client.connect(clientSide)
  return client
}

const call = async (client: Client, name: string, args: Record<string, unknown> = {}): Promise<string> => {
  const result = await client.callTool({ name, arguments: args })
  const content = result.content as readonly { type: string; text?: string }[]
  return R.join(R.map(content, (part) => part.text ?? ''), '\n')
}

const firstResult = (output: string): string => /^1\. (\S+)/m.exec(output)?.[1] ?? ''

describe('receta-assets MCP server', () => {
  it('lists the five read-only tools', async () => {
    const client = await connect(fakeVectors)
    const { tools } = await client.listTools()
    expect(R.map(tools, R.prop('name')).sort()).toEqual(
      ['authoring_guide', 'browse', 'get_asset', 'related_assets', 'search_assets'],
    )
    expect(R.filter(tools, (tool) => tool.annotations?.readOnlyHint !== true)).toEqual([])
  })

  it('finds an asset by the job, and by the job with its types', async () => {
    const client = await connect(fakeVectors)
    expect(firstResult(await call(client, 'search_assets', { job: 'parse a port number from an env var' }))).toBe(
      'parse/parsePort',
    )
    const typed = await call(client, 'search_assets', {
      job: 'retry a flaky call with a time limit on each attempt',
      input: '() => Promise<T>',
      output: 'Promise<Result<T, RetryError>>',
    })
    expect(firstResult(typed)).toBe('async/retryWithTimeout')
    expect(typed).toContain('takes (task: () => Promise<T>, options: RetryWithTimeoutOptions)')
  })

  it('keeps answering from words when the vector index fails', async () => {
    const client = await connect(failingVectors)
    const output = await call(client, 'search_assets', { job: 'mask credit card number' })
    expect(firstResult(output)).toBe('text/maskCardNumber')
    expect(output).toContain('Ranked by words only')
  })

  it('searches one category when asked', async () => {
    const client = await connect(fakeVectors)
    const output = await call(client, 'search_assets', { job: 'dedupe', category: 'collection', limit: 20 })
    const keys = R.map([...output.matchAll(/^\d+\. (\S+)/gm)], (match) => match[1] ?? '')
    expect(keys.length).toBeGreaterThan(0)
    expect(R.filter(keys, (key) => !key.startsWith('collection/'))).toEqual([])
  })

  it('returns a whole file, by name or by category/name', async () => {
    const client = await connect(fakeVectors)
    const byName = await call(client, 'get_asset', { name: 'parsePort' })
    expect(byName).toContain('export function parsePort(')
    expect(byName).toContain("import { parsePort } from '@ontologyio/receta-assets/parse'")
    expect(await call(client, 'get_asset', { name: 'parse/parsePort' })).toBe(byName)
    expect(await call(client, 'get_asset', { name: 'nope' })).toContain('No asset named "nope"')
  })

  it('browses categories, then one category', async () => {
    const client = await connect(fakeVectors)
    const all = await call(client, 'browse')
    expect(all).toContain(`${bundle.count} assets:`)
    expect(all).toContain('- parse (')
    const parse = await call(client, 'browse', { category: 'parse' })
    expect(parse).toContain('- parsePort: ')
  })

  it("finds an asset's variants, without the asset itself", async () => {
    const client = await connect(fakeVectors)
    const output = await call(client, 'related_assets', { name: 'dedupeByKeepFirst' })
    expect(output).not.toMatch(/^\d+\. collection\/dedupeByKeepFirst\b/m)
    expect(output).toContain('collection/dedupeByKeepLast')
  })

  it('hands out the authoring rules with a note for projects', async () => {
    const client = await connect(undefined)
    const output = await call(client, 'authoring_guide')
    expect(output).toContain("project's helper folder")
    expect(output).toContain('# Writing an asset')
  })
})
