// Calls a deployed marketplace the way an agent would, over MCP, and prints what came back.
//   bun scripts/smoke.ts <url of /mcp>   or set RECETA_MARKET_URL
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import * as R from 'remeda'

const url = process.argv[2] ?? process.env['RECETA_MARKET_URL']
if (url === undefined) {
  console.error('Usage: bun scripts/smoke.ts <url of /mcp>, or set RECETA_MARKET_URL')
  process.exit(1)
}

const QUERIES: readonly Record<string, string>[] = [
  { job: 'dedupe webhook events by id, keep the newest by receivedAt' },
  { job: 'read a duration like 1h30m from config into milliseconds' },
  { job: 'make sure a value from an env var is a valid TCP port', input: 'string', output: 'Result<number>' },
  { job: 'stop hammering an API after it fails several times in a row' },
  { job: 'show only the last four digits of a saved card' },
]

const client = new Client({ name: 'smoke', version: '0' })
await client.connect(new StreamableHTTPClientTransport(new URL(url)))
const { tools } = await client.listTools()
console.log(`tools: ${R.join(R.map(tools, R.prop('name')), ', ')}\n`)

const top = (text: string): string =>
  R.join(R.map([...text.matchAll(/^\d+\. (\S+)\s+\(score ([\d.]+)\)/gm)].slice(0, 3), (m) => `${m[1]} ${m[2]}`), ' | ')

for (const query of QUERIES) {
  const result = await client.callTool({ name: 'search_assets', arguments: query })
  const text = R.join(R.map(result.content as readonly { text?: string }[], (part) => part.text ?? ''), '\n')
  console.log(`${query['job']}\n  → ${top(text)}${text.includes('words only') ? '  (words only)' : ''}`)
}
await client.close()
