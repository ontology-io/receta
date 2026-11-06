// Serves the static export from R2. A bucket can't answer "/" with index.html on its
// own, so this Worker maps URLs to objects, after sending old addresses to the site's
// one public address. Start at serveSite.
import { fromNullable, match } from '@ontologyio/receta/option'
import { isDocsPage, NOT_FOUND_KEY, objectKey } from '../src/lib/hosting/objects'
import { canonicalRedirect } from '../src/lib/hosting/redirects'

type Env = { readonly SITE: R2Bucket }

const READ_METHODS = new Set(['GET', 'HEAD'])

const serveSite = async (request: Request, env: Env): Promise<Response> => {
  if (!READ_METHODS.has(request.method)) return methodNotAllowed()
  return match(canonicalRedirect(request.url), {
    onSome: async (location) => Response.redirect(location, 301),
    onNone: () => serveObject(request, env),
  })
}

const serveObject = async (request: Request, env: Env): Promise<Response> => {
  const key = objectKey(new URL(request.url).pathname, request.headers.get('accept') ?? '')
  const stored = await env.SITE.get(key, { onlyIf: request.headers })
  return match(fromNullable(stored), {
    onSome: async (object) => withVary(toResponse(object, 200), key),
    onNone: () => notFound(env),
  })
}

const methodNotAllowed = (): Response =>
  new Response(null, { status: 405, headers: { allow: 'GET, HEAD' } })

const notFound = async (env: Env): Promise<Response> =>
  match(fromNullable(await env.SITE.get(NOT_FOUND_KEY)), {
    onSome: (page) => toResponse(page, 404),
    onNone: () => new Response(null, { status: 404 }),
  })

/** A docs address answers with HTML or markdown, so caches have to keep both apart. */
const withVary = (response: Response, key: string): Response => {
  if (isDocsPage(key)) response.headers.set('vary', 'accept')
  return response
}

/** R2 leaves the body out when the reader's copy is still current. */
const toResponse = (object: R2Object | R2ObjectBody, status: number): Response => {
  const headers = new Headers({ etag: object.httpEtag, 'x-content-type-options': 'nosniff' })
  object.writeHttpMetadata(headers)
  return 'body' in object
    ? new Response(object.body, { status, headers })
    : new Response(null, { status: 304, headers })
}

export default { fetch: serveSite } satisfies ExportedHandler<Env>
