// The marketplace Worker, mounted at BASE_PATH (empty on a domain of its own):
//
//   /mcp                     agents, over MCP
//   /  /c/<id>  /a/<key>     the registry pages: submissions, assets, votes
//   /category/<name>  /all   browsing the catalog
//   /fonts/*                 the pages' fonts, from public/ (static assets)
//   /vote  /auth/*           voting, signed in with GitHub
//   /api/candidates          the review list, most voted first, as JSON
//   /api/submissions/<id>    one submission as JSON, read by receta-assets' intake
//   /admin/*                 reindex, explain, decide; the ADMIN_TOKEN bearer only
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js'
import { mapAsyncOrThrow } from '@ontologyio/receta/async'
import * as R from 'remeda'
import { findAsset, search } from '../../../plugins/receta-skills/skills/assets/scripts/core.ts'
import { type AuthConfig, callback, login, logout, type Person, personOf } from './auth'
import { type BundledAsset, bundle, keyOf } from './bundle'
import { listingOf } from './candidates'
import { cloudflareVectors, type Env, reindex } from './cloudflare'
import { allPage, assetPage, candidatePage, categoryPage, homePage, notFoundPage, type PageContext, searchPage } from './pages'
import { candidateKey, d1Registry, NO_TALLY, type Registry, type SubmissionStatus, type Tally } from './registry'
import { rank, rawScores, type SearchQuery, withTallies } from './search'
import { type Caller, createServer } from './server'
import { entriesFor, keyFor } from './vectors'

const OPT_OUT = ['0', 'false', 'no', 'off']

const basePathOf = (env: Env): string => (env.BASE_PATH ?? '').replace(/\/+$/, '')

/** A salted hash of the caller's address: enough to rate-limit, not enough to identify. */
const senderOf = async (request: Request, env: Env): Promise<string> => {
  const address = request.headers.get('cf-connecting-ip') ?? 'unknown'
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${env.SENDER_SALT ?? ''}:${address}`))
  return R.join(R.map([...new Uint8Array(digest)].slice(0, 16), (byte) => byte.toString(16).padStart(2, '0')), '')
}

const authConfig = (env: Env, origin: string): AuthConfig | undefined =>
  env.GITHUB_CLIENT_ID === undefined || env.GITHUB_CLIENT_SECRET === undefined || env.SESSION_SECRET === undefined
    ? undefined
    : {
        clientId: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
        sessionSecret: env.SESSION_SECRET,
        baseUrl: `${origin}${basePathOf(env)}`,
        basePath: basePathOf(env),
      }

const handleMcp = async (request: Request, env: Env, registry: Registry, origin: string): Promise<Response> => {
  const caller: Caller = {
    sender: await senderOf(request, env),
    shareOff: OPT_OUT.includes((request.headers.get('x-receta-share') ?? '').toLowerCase()),
    registryUrl: `${origin}${basePathOf(env)}`,
  }
  // Stateless: a fresh server per request and no sessionIdGenerator, so no session state
  // lives in the Worker.
  const server = createServer({ bundle, vectors: cloudflareVectors(env), registry, caller })
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

const isAdmin = (request: Request, env: Env): boolean => {
  const given = (request.headers.get('authorization') ?? '').replace(/^Bearer /, '')
  return env.ADMIN_TOKEN !== undefined && env.ADMIN_TOKEN !== '' && sameSecret(given, env.ADMIN_TOKEN)
}

const handleAdmin = async (path: string, request: Request, env: Env, registry: Registry): Promise<Response> => {
  const vectors = cloudflareVectors(env)
  if (path === '/admin/reindex') {
    const candidates = R.map(await registry.candidates(10_000), listingOf)
    return Response.json({
      indexed: await reindex(vectors, bundle, candidates),
      assets: bundle.count,
      candidates: candidates.length,
      builtAt: bundle.builtAt,
    })
  }
  if (path === '/admin/explain') {
    // Every signal's raw scores for a query, to tune the blend offline (scripts/eval.ts).
    const query = (await request.json()) as SearchQuery & { readonly instruct?: boolean }
    const raw = await rawScores(bundle.assets, query, cloudflareVectors(env, { instruct: query.instruct !== false }))
    return Response.json({
      asked: raw.asked,
      words: Object.fromEntries(raw.words),
      fields:
        raw.fields === undefined
          ? null
          : Object.fromEntries([...raw.fields.entries()].map(([field, scores]) => [field, Object.fromEntries(scores)])),
    })
  }
  if (path === '/admin/decide') {
    // Accepting is a commit to receta-assets; this records the decision and takes the
    // submission out of the candidate index, since an accepted one comes back as reviewed.
    const { id, status, note } = (await request.json()) as { id: string; status: SubmissionStatus; note?: string }
    if (status !== 'accepted' && status !== 'declined') {
      return Response.json({ error: 'status is accepted or declined' }, { status: 400 })
    }
    const submission = await registry.find(id)
    if (submission === undefined || !(await registry.decide(id, status, note ?? ''))) {
      return Response.json({ error: `no submission ${id}` }, { status: 404 })
    }
    await vectors.remove(R.map(entriesFor(listingOf(submission), 'candidate'), R.prop('id')))
    return Response.json({ id, status })
  }
  return new Response('Not found', { status: 404 })
}

const handleVote = async (request: Request, origin: string, base: string, registry: Registry, person: Person | undefined): Promise<Response> => {
  // The session cookie is SameSite=Lax, and the Origin must be ours: no voting from other sites.
  if (person === undefined || request.headers.get('origin') !== origin) return new Response('Forbidden', { status: 403 })
  const form = await request.formData()
  const item = String(form.get('item') ?? '')
  const candidateId = /^candidate\/(\w+)$/.exec(item)?.[1]
  const exists =
    candidateId === undefined
      ? findAsset(bundle.assets, item) !== undefined
      : (await registry.find(candidateId))?.status === 'candidate'
  if (!exists) return new Response('Nothing to vote for', { status: 404 })
  await registry.vote(item, person.id, form.get('on') === '1')
  const back = candidateId === undefined ? `${base}/a/${item}` : `${base}/c/${candidateId}`
  return new Response(null, { status: 303, headers: { location: back } })
}

/** D1 binds at most 100 parameters to one statement, so tallies of a long list go in parts. */
const talliesOf = async (registry: Registry, items: readonly string[]): Promise<ReadonlyMap<string, Tally>> => {
  const parts = await mapAsyncOrThrow(R.chunk(items, 90), (part) => registry.tallies(part), { concurrency: 2 })
  return new Map(R.flatMap(parts, (part) => [...part.entries()]))
}

const assetOf = (key: string): BundledAsset | undefined => findAsset(bundle.assets, key) as BundledAsset | undefined

/** The unreviewed functions the review list waits on, at most this many deep. */
const QUEUE_DEPTH = 1000

const SEARCH_RESULTS = 20
const MAX_QUERY = 200

/**
 * People's search: the same ranking as the agents' search_assets, vectors and words, lifted
 * by votes and reports. Unreviewed submissions only when asked for, as for agents. An address
 * past its rate limit is ranked by words alone, which costs no Workers AI call.
 */
const handleSearch = async (url: URL, request: Request, env: Env, registry: Registry, context: PageContext): Promise<Response> => {
  const query = (url.searchParams.get('q') ?? '').trim().slice(0, MAX_QUERY)
  if (query.length < 2) return Response.redirect(`${url.origin}${basePathOf(env)}/#categories`, 303)
  const unreviewed = url.searchParams.get('unreviewed') === '1'
  const allowed =
    env.SEARCH_LIMIT === undefined || (await env.SEARCH_LIMIT.limit({ key: await senderOf(request, env) })).success
  const candidates = unreviewed ? R.map(await registry.candidates(300), listingOf) : []
  const ranked = await rank(
    [...bundle.assets, ...candidates],
    {
      job: query,
      limit: SEARCH_RESULTS * 2,
      statuses: candidates.length > 0 ? ['reviewed', 'candidate'] : ['reviewed'],
    },
    allowed ? cloudflareVectors(env) : undefined,
  )
  const tallies = await talliesOf(registry, R.map(ranked, (hit) => keyFor(hit.asset)))
  const results = withTallies(ranked, tallies, SEARCH_RESULTS)
  return searchPage(
    // Signing in from here comes back to the same search.
    { ...context, path: `${url.pathname}${url.search}` },
    {
      query,
      unreviewed,
      results: R.map(results, (hit) => ({ listing: hit.asset, tally: hit.tally })),
      semantic: results[0]?.semantic ?? allowed,
    },
  )
}

const handlePage = async (path: string, context: PageContext, registry: Registry): Promise<Response> => {
  const voted = async (item: string): Promise<boolean> =>
    context.person !== undefined && (await registry.hasVoted(item, context.person.id))
  if (path === '/') {
    const candidates = await registry.candidates(50)
    const popular = R.pipe(
      await registry.mostVoted(30),
      R.map(([item]) => assetOf(item)),
      R.filter(R.isNonNullish),
      R.take(10),
    )
    const tallies = await talliesOf(registry, [
      ...R.map(candidates, (submission) => candidateKey(submission.id)),
      ...R.map(popular, keyOf),
    ])
    return homePage(context, {
      categories: bundle.categories,
      candidates: R.map(candidates, (submission) => [submission, tallies.get(candidateKey(submission.id)) ?? NO_TALLY] as const),
      popular: R.map(popular, (asset) => [asset, tallies.get(keyOf(asset)) ?? NO_TALLY] as const),
    })
  }
  const candidateId = /^\/c\/(\w+)$/.exec(path)?.[1]
  if (candidateId !== undefined) {
    const submission = await registry.find(candidateId)
    if (submission === undefined) return notFoundPage(context)
    const item = candidateKey(submission.id)
    const tally = (await registry.tallies([item])).get(item) ?? NO_TALLY
    // Its place in the review list: most voted first, then newest, as registry.candidates sorts.
    const queue = submission.status === 'candidate' ? await registry.candidates(QUEUE_DEPTH) : []
    const place = R.findIndex(queue, (waiting) => waiting.id === submission.id) + 1
    const adaptedFrom = submission.adaptedFrom === '' ? undefined : assetOf(submission.adaptedFrom)
    return candidatePage(context, {
      submission,
      tally,
      voted: await voted(item),
      ...(place > 0 ? { queue: { place, of: queue.length } } : {}),
      ...(adaptedFrom === undefined ? {} : { adaptedFrom }),
    })
  }
  const assetKey = /^\/a\/([a-z]+\/\w+)$/.exec(path)?.[1]
  const asset = assetKey === undefined ? undefined : assetOf(assetKey)
  if (asset !== undefined) {
    const key = keyOf(asset)
    const tally = (await registry.tallies([key])).get(key) ?? NO_TALLY
    const siblings = R.filter(bundle.assets, (other) => other.category === asset.category && keyOf(other) !== key)
    const near = R.pipe(
      search(siblings, `${asset.summary} ${R.join(asset.tags, ' ')}`, { limit: 3 }),
      R.map((hit) => hit.asset as BundledAsset),
    )
    return assetPage(context, {
      asset,
      tally,
      voted: await voted(key),
      category: R.find(bundle.categories, (category) => category.name === asset.category),
      near,
    })
  }
  const categoryName = /^\/category\/([a-z]+)$/.exec(path)?.[1]
  const category = categoryName === undefined ? undefined : R.find(bundle.categories, (info) => info.name === categoryName)
  if (category !== undefined) {
    const assets = R.filter(bundle.assets, (other) => other.category === category.name)
    const tallies = await talliesOf(registry, R.map(assets, keyOf))
    return categoryPage(context, {
      category,
      assets: R.map(assets, (other) => [other, tallies.get(keyOf(other)) ?? NO_TALLY] as const),
    })
  }
  if (path === '/all') return allPage(context, bundle.assets)
  return notFoundPage(context)
}

const handleApi = async (path: string, registry: Registry): Promise<Response> => {
  if (path === '/api/candidates') {
    const candidates = await registry.candidates(200)
    const tallies = await registry.tallies(R.map(candidates, (submission) => candidateKey(submission.id)))
    return Response.json(
      R.map(candidates, (submission) => ({
        id: submission.id,
        name: submission.name,
        category: submission.category,
        summary: submission.summary,
        createdAt: submission.createdAt,
        ...(tallies.get(candidateKey(submission.id)) ?? NO_TALLY),
      })),
    )
  }
  const id = /^\/api\/submissions\/(\w+)$/.exec(path)?.[1]
  const submission = id === undefined ? undefined : await registry.find(id)
  return submission === undefined ? Response.json({ error: 'not found' }, { status: 404 }) : Response.json(submission)
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const base = basePathOf(env)
    if (base !== '' && url.pathname !== base && !url.pathname.startsWith(`${base}/`)) {
      return new Response('Not found', { status: 404 })
    }
    const path = url.pathname.slice(base.length) || '/'
    const registry = d1Registry(env.DB)
    const auth = authConfig(env, url.origin)

    if (path === '/mcp') return handleMcp(request, env, registry, url.origin)
    // On a domain of its own, static assets answer /fonts/* before the Worker runs; under a
    // base path the request arrives here, and the Worker asks for the same file.
    if (path.startsWith('/fonts/') && env.ASSETS !== undefined) return env.ASSETS.fetch(new URL(path, url.origin))
    if (path.startsWith('/admin/')) {
      if (request.method !== 'POST' || !isAdmin(request, env)) return new Response('Unauthorized', { status: 401 })
      return handleAdmin(path, request, env, registry)
    }
    if (path.startsWith('/api/')) return handleApi(path, registry)
    if (path === '/auth/login') return auth === undefined ? new Response('Voting opens soon', { status: 503 }) : login(request, auth)
    if (path === '/auth/callback' && auth !== undefined) return callback(request, auth)
    if (path === '/auth/logout' && request.method === 'POST' && auth !== undefined) return logout(auth)
    const person = auth === undefined ? undefined : await personOf(request, auth)
    if (path === '/vote' && request.method === 'POST') return handleVote(request, url.origin, base, registry, person)
    // HEAD answers like GET; the runtime drops the body. Link checkers and crawlers send it.
    if (request.method !== 'GET' && request.method !== 'HEAD') return new Response('Method not allowed', { status: 405 })
    const context: PageContext = {
      basePath: base,
      mcpUrl: `${url.origin}${base}/mcp`,
      person,
      votingOpen: auth !== undefined,
      path: url.pathname,
      assetCount: bundle.count,
      now: new Date(),
    }
    if (path === '/search') return handleSearch(url, request, env, registry, context)
    return handlePage(path, context, registry)
  },
} satisfies ExportedHandler<Env>
