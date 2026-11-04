// Serves the static export from R2. A bucket can't answer "/" with index.html on its
// own, so this Worker maps URLs to objects and does nothing else. Start at serveSite.
import { fromNullable, match } from '@ontologyio/receta/option'
import { NOT_FOUND_KEY, objectKey } from '../src/lib/hosting/objects'

type Env = { readonly SITE: R2Bucket }

const READ_METHODS = new Set(['GET', 'HEAD'])

const serveSite = async (request: Request, env: Env): Promise<Response> => {
  if (!READ_METHODS.has(request.method)) return methodNotAllowed()
  const key = objectKey(new URL(request.url).pathname)
  const stored = await env.SITE.get(key, { onlyIf: request.headers })
  return match(fromNullable(stored), {
    onSome: async (object) => toResponse(object, 200),
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

/** R2 leaves the body out when the reader's copy is still current. */
const toResponse = (object: R2Object | R2ObjectBody, status: number): Response => {
  const headers = new Headers({ etag: object.httpEtag, 'x-content-type-options': 'nosniff' })
  object.writeHttpMetadata(headers)
  return 'body' in object
    ? new Response(object.body, { status, headers })
    : new Response(null, { status: 304, headers })
}

export default { fetch: serveSite } satisfies ExportedHandler<Env>
