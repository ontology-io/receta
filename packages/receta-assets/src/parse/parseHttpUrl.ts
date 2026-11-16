import * as R from 'remeda'
import { oneOf } from '@ontologyio/receta/predicate'
import { err, flatMap, ok, tryCatch, type Result } from '@ontologyio/receta/result'

export type ParseHttpUrlError = {
  readonly code: 'INVALID_URL' | 'NOT_HTTP'
  readonly input: string
  readonly message: string
}

const isWebProtocol = oneOf(['http:', 'https:'])

/**
 * Parses an absolute `http` or `https` URL from text into a `URL`, refusing other schemes and relative paths.
 *
 * Use when: a person or a config supplies a link the server will call or redirect to, such
 * as a webhook endpoint, a callback URL, an avatar URL or `API_BASE_URL`. `new URL` throws on
 * bad input and happily accepts `javascript:`, `file:` and `ftp:`; this returns an `Err`
 * for all of them. Surrounding spaces are trimmed. It doesn't check which host the URL points
 * to, so add an allow-list when calling user-supplied URLs from a server.
 *
 * @example
 * ```ts
 * import { map, mapErr } from '@ontologyio/receta/result'
 *
 * R.pipe(parseHttpUrl(' https://example.com/hooks?id=7 '), map((url) => url.hostname))
 * // => Ok('example.com')
 *
 * parseHttpUrl('example.com/hooks')
 * // => Err({ code: 'INVALID_URL', input: 'example.com/hooks', message: 'Expected an absolute URL such as https://example.com, got "example.com/hooks"' })
 *
 * R.pipe(parseHttpUrl('javascript:alert(1)'), mapErr((error) => error.code))
 * // => Err('NOT_HTTP')
 * ```
 *
 * @tags url, link, http, https, webhook, redirect, callback, validate, ssrf
 * @see tryCatch - @ontologyio/receta/result, turns the URL constructor's throw into an Err
 * @see isUrl - @ontologyio/receta/string, the yes-or-no check for any scheme
 */
export function parseHttpUrl(input: string): Result<URL, ParseHttpUrlError> {
  return R.pipe(
    tryCatch(
      () => new URL(input.trim()),
      (): ParseHttpUrlError => ({
        code: 'INVALID_URL',
        input,
        message: `Expected an absolute URL such as https://example.com, got "${input}"`,
      }),
    ),
    flatMap((url) =>
      isWebProtocol(url.protocol)
        ? ok(url)
        : err<ParseHttpUrlError>({
            code: 'NOT_HTTP',
            input,
            message: `Expected an http or https URL, got ${url.protocol.replace(/:$/, '')}`,
          }),
    ),
  )
}
