// Drives the server through a real MCP client, with the fakes in fakes.ts standing in for
// Vectorize, Workers AI and D1.
import { describe, expect, it } from 'bun:test'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
import * as R from 'remeda'
import { bundle } from '../src/bundle'
import { signatureOf } from '../src/candidates'
import type { Registry } from '../src/registry'
import { type Caller, createServer } from '../src/server'
import type { Vectors } from '../src/vectors'
import { failingVectors, fakeVectors, memoryRegistry } from './fakes'

const CALLER: Caller = { sender: 'sender-hash', shareOff: false, registryUrl: 'https://example.test/market' }

const connect = async (
  vectors: Vectors | undefined,
  registry?: Registry,
  caller: Caller = CALLER,
): Promise<Client> => {
  const [clientSide, serverSide] = InMemoryTransport.createLinkedPair()
  await createServer({ bundle, vectors, registry, caller: registry === undefined ? undefined : caller }).connect(serverSide)
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

// A variant an agent might write: maskCardNumber's policy, for bank accounts.
const IBAN = `import * as R from 'remeda'
import { extract } from '@ontologyio/receta/string'

const MIN_IBAN_LENGTH = 15

/**
 * Shows an IBAN as \`DE•• •••• 3000\`, the country code and the last four characters behind a mask.
 *
 * Use when: showing a saved bank account in settings or payout screens. Spaces don't matter.
 * Input shorter than 15 characters isn't an IBAN and comes back fully masked.
 *
 * @example
 * \`\`\`ts
 * maskIban('DE89 3704 0044 0532 0130 00')
 * // => 'DE•• •••• 3000'
 *
 * maskIban('DE89')
 * // => '••••'
 * \`\`\`
 *
 * @tags mask, iban, bank account, payout, redact, last four
 */
export function maskIban(iban: string): string {
  const characters = extract(iban.toUpperCase(), /[A-Z0-9]/g)
  return characters.length < MIN_IBAN_LENGTH
    ? '••••'
    : \`\${R.join(R.take(characters, 2), '')}•• •••• \${R.join(R.takeLast(characters, 4), '')}\`
}
`

const offer = { file: IBAN, category: 'text', why: 'Payout settings show a saved IBAN without exposing it.', person_agreed: true }

describe('reading the catalog', () => {
  it('lists the read-only tools, and only those without a registry', async () => {
    const client = await connect(fakeVectors())
    const { tools } = await client.listTools()
    expect(R.map(tools, R.prop('name')).sort()).toEqual(['authoring_guide', 'browse', 'get_asset', 'related_assets', 'search_assets'])
    expect(R.filter(tools, (tool) => tool.annotations?.readOnlyHint !== true)).toEqual([])
  })

  it('finds an asset by the job, and by the job with its types', async () => {
    const client = await connect(fakeVectors())
    expect(firstResult(await call(client, 'search_assets', { job: 'parse a port number from an env var' }))).toBe('parse/parsePort')
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
    const client = await connect(fakeVectors())
    const output = await call(client, 'search_assets', { job: 'dedupe', category: 'collection', limit: 20 })
    const keys = R.map([...output.matchAll(/^\d+\. (\S+)/gm)], (match) => match[1] ?? '')
    expect(keys.length).toBeGreaterThan(0)
    expect(R.filter(keys, (key) => !key.startsWith('collection/'))).toEqual([])
  })

  it('returns a whole file, by name or by category/name', async () => {
    const client = await connect(fakeVectors())
    const byName = await call(client, 'get_asset', { name: 'parsePort' })
    expect(byName).toContain('export function parsePort(')
    expect(byName).toContain("import { parsePort } from '@ontologyio/receta-assets/parse'")
    expect(await call(client, 'get_asset', { name: 'parse/parsePort' })).toBe(byName)
    expect(await call(client, 'get_asset', { name: 'nope' })).toContain('No asset named "nope"')
  })

  it('browses categories, then one category', async () => {
    const client = await connect(fakeVectors())
    expect(await call(client, 'browse')).toContain(`${bundle.count} assets:`)
    expect(await call(client, 'browse', { category: 'parse' })).toContain('- parsePort: ')
  })

  it("finds an asset's variants, without the asset itself", async () => {
    const client = await connect(fakeVectors())
    const output = await call(client, 'related_assets', { name: 'dedupeByKeepFirst' })
    expect(output).not.toMatch(/^\d+\. collection\/dedupeByKeepFirst\b/m)
    expect(output).toContain('collection/dedupeByKeepLast')
  })

  it('hands out the authoring rules with a note for projects', async () => {
    const output = await call(await connect(undefined), 'authoring_guide')
    expect(output).toContain("project's helper folder")
    expect(output).toContain('# Writing an asset')
  })
})

describe('offering a function', () => {
  it('needs the person to have agreed', async () => {
    const client = await connect(fakeVectors(), memoryRegistry())
    const result = await client.callTool({ name: 'submit_asset', arguments: { ...offer, person_agreed: false } })
    expect(result.isError).toBe(true)
  })

  it('stores a new function as an unreviewed candidate and indexes it', async () => {
    const vectors = fakeVectors()
    const registry = memoryRegistry()
    const client = await connect(vectors, registry)
    const output = await call(client, 'submit_asset', offer)
    expect(output).toMatch(/Stored as candidate\/\w+, listed as unreviewed at https:\/\/example\.test\/market\/c\/\w+/)
    expect(output).toContain('text/maskCardNumber')
    const [stored] = await registry.candidates(10)
    expect(stored?.name).toBe('maskIban')
    expect(stored?.inputs).toEqual([{ name: 'iban', type: 'string' }])
    expect(R.filter(vectors.stored(), (entry) => entry.metadata.status === 'candidate').length).toBe(3)
  })

  it('keeps candidates out of search unless asked, and marks them when asked', async () => {
    const vectors = fakeVectors()
    const registry = memoryRegistry()
    const client = await connect(vectors, registry)
    await call(client, 'submit_asset', offer)
    const job = { job: 'mask an iban bank account number', limit: 20 }
    expect(await call(client, 'search_assets', job)).not.toContain('candidate/')
    const withCandidates = await call(client, 'search_assets', { ...job, include_candidates: true })
    expect(withCandidates).toMatch(/^1\. candidate\/\w+ {2}UNREVIEWED: text\/maskIban/m)
    const id = /candidate\/(\w+)/.exec(withCandidates)?.[1] ?? ''
    expect(await call(client, 'get_asset', { name: `candidate/${id}` })).toContain('UNREVIEWED')
  })

  it('turns away a copy, project code, private text and a taken name', async () => {
    const client = await connect(fakeVectors(), memoryRegistry())
    const attempt = async (file: string): Promise<string> => call(client, 'submit_asset', { ...offer, file })
    const copy = bundle.assets.find((asset) => asset.name === 'maskCardNumber')?.source ?? ''
    expect(await attempt(copy)).toContain('UNCHANGED_COPY')
    expect(await attempt(IBAN.replace("import * as R from 'remeda'", "import * as R from 'remeda'\nimport { x } from './x'"))).toContain(
      'PROJECT_CODE',
    )
    expect(await attempt(IBAN.replace('settings or payout screens', 'https://acme.internal/payouts'))).toContain('PRIVATE_TEXT')
    expect(await attempt(IBAN.replaceAll('maskIban', 'maskCardNumber'))).toContain('NAME_TAKEN')
    expect(await attempt(IBAN.replace(/^ \* @tags.*$/m, ''))).toContain('NOT_AN_ASSET')
  })

  it('refuses a second offer of the same name, and anything when the person opted out', async () => {
    const registry = memoryRegistry()
    const client = await connect(fakeVectors(), registry)
    await call(client, 'submit_asset', offer)
    expect(await call(client, 'submit_asset', offer)).toContain('already offered as candidate/')
    const optedOut = await connect(fakeVectors(), memoryRegistry(), { ...CALLER, shareOff: true })
    expect(await call(optedOut, 'submit_asset', offer)).toContain('Sharing is off')
  })
})

describe('reporting use', () => {
  it('counts what agents report, apart from votes, and shows it in search', async () => {
    const registry = memoryRegistry()
    const client = await connect(fakeVectors(), registry)
    expect(await call(client, 'report_use', { name: 'parsePort', worked: true })).toContain('Recorded: parse/parsePort worked')
    await call(client, 'report_use', { name: 'parse/parsePort', worked: false })
    expect((await registry.tallies(['parse/parsePort'])).get('parse/parsePort')).toEqual({ votes: 0, worked: 1, failed: 1 })
    expect(await call(client, 'search_assets', { job: 'parse a port number from an env var' })).toContain(
      'agents report it worked 1 times, failed 1',
    )
    const result = await client.callTool({ name: 'report_use', arguments: { name: 'nope', worked: true } })
    expect(result.isError).toBe(true)
  })
})

describe('reading a signature from text', () => {
  it('splits parameters at the top level and keeps the return type', () => {
    const code = 'export function pick<T>(items: readonly T[], by: (item: T) => number, options?: { limit: number }): Result<T[], E> {\n}'
    expect(signatureOf(code, 'pick')).toEqual({
      inputs: [
        { name: 'items', type: 'readonly T[]' },
        { name: 'by', type: '(item: T) => number' },
        { name: 'options', type: '{ limit: number }' },
      ],
      output: 'Result<T[], E>',
    })
  })
})
