// Calls one tool on a deployed marketplace and prints its whole answer.
//   bun scripts/ask.ts <url of /mcp> <tool> '<json arguments>'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import { parseJSON, unwrapOr } from '@ontologyio/receta/result'

const [url, tool = 'search_assets', json = '{}'] = process.argv.slice(2)
if (url === undefined) {
  console.error("Usage: bun scripts/ask.ts <url of /mcp> <tool> '<json arguments>'")
  process.exit(1)
}
const client = new Client({ name: 'ask', version: '0' })
await client.connect(new StreamableHTTPClientTransport(new URL(url)))
const result = await client.callTool({ name: tool, arguments: unwrapOr(parseJSON<Record<string, unknown>>(json), {}) })
console.log(JSON.stringify(result, null, 2).slice(0, 4000))
await client.close()
