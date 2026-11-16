// The marketplace Worker. /mcp answers agents; /admin/reindex rebuilds the vectors after a
// catalog release; / says what this is to a person who opens it in a browser.
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js'
import { bundle } from './bundle'
import { cloudflareVectors, type Env, reindex } from './cloudflare'
import { createServer } from './server'

const handleMcp = async (request: Request, env: Env): Promise<Response> => {
  // Stateless: a fresh server per request and no sessionIdGenerator, so no session state
  // lives in the Worker.
  const server = createServer({ bundle, vectors: cloudflareVectors(env) })
  const transport = new WebStandardStreamableHTTPServerTransport({ enableJsonResponse: true })
  await server.connect(transport)
  return transport.handleRequest(request)
}

const sameSecret = (given: string, expected: string): boolean => {
  const encoder = new TextEncoder()
  const a = encoder.encode(given)
  const b = encoder.encode(expected)
  return a.byteLength === b.byteLength && crypto.subtle.timingSafeEqual(a, b)
}

const handleReindex = async (request: Request, env: Env): Promise<Response> => {
  const given = (request.headers.get('authorization') ?? '').replace(/^Bearer /, '')
  if (env.ADMIN_TOKEN === undefined || env.ADMIN_TOKEN === '' || !sameSecret(given, env.ADMIN_TOKEN)) {
    return new Response('Unauthorized', { status: 401 })
  }
  return Response.json({ indexed: await reindex(env, bundle), assets: bundle.count, builtAt: bundle.builtAt })
}

const about = (url: URL): Response =>
  new Response(
    `receta-assets marketplace: ${bundle.count} checked functions built from Receta and Remeda.\n\n` +
      `Agents connect over MCP at ${url.origin}/mcp. In Claude Code:\n` +
      `  claude mcp add --transport http receta-assets ${url.origin}/mcp\n`,
    { headers: { 'content-type': 'text/plain; charset=utf-8' } },
  )

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    if (url.pathname === '/mcp') return handleMcp(request, env)
    if (url.pathname === '/admin/reindex' && request.method === 'POST') return handleReindex(request, env)
    if (url.pathname === '/') return about(url)
    return new Response('Not found', { status: 404 })
  },
} satisfies ExportedHandler<Env>
