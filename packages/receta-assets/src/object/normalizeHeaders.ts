import * as R from 'remeda'
import { compact, type PlainObject } from '@ontologyio/receta/object'

/** What a header bag may hold, Node's `IncomingHttpHeaders` and plain objects included. */
export type NormalizeHeadersInput = Readonly<
  Record<string, string | number | readonly string[] | null | undefined>
>

type HeaderValue = string | number | readonly string[]

/** One `[name, value]` pair per value, so arrays and duplicates group the same way. */
const toPairs = ([name, value]: readonly [string, HeaderValue]): ReadonlyArray<readonly [string, string]> =>
  R.map(R.isArray(value) ? value : [String(value)], (single) => [R.toLowerCase(name.trim()), single.trim()] as const)

const joinValues = (pairs: ReadonlyArray<readonly [string, string]>): string => R.join(R.map(pairs, R.last()), ', ')

/**
 * Lower-cases header names, trims values and merges duplicates into one `Record<string, string>`.
 *
 * Use when: comparing, logging, signing or forwarding HTTP headers that came from more than
 * one place, such as Node's `req.headers`, a fetch init and your defaults, where `Content-Type`
 * and `content-type` must be the same header. Names are lower-cased and trimmed. A header that
 * appears twice, or as an array, has its values joined with `', '` in the order seen. Numbers
 * become strings, and `null` and `undefined` values are dropped. Don't use it for `set-cookie`,
 * whose values can't be joined with commas.
 *
 * @example
 * ```ts
 * normalizeHeaders({
 *   'Content-Type': 'application/json',
 *   ' X-Request-Id ': ' r1 ',
 *   Accept: ['text/html', 'application/json'],
 *   'content-length': 42,
 *   Authorization: undefined,
 * })
 * // => {
 * //   'content-type': 'application/json',
 * //   'x-request-id': 'r1',
 * //   accept: 'text/html, application/json',
 * //   'content-length': '42',
 * // }
 *
 * normalizeHeaders({ 'Cache-Control': 'no-cache', 'cache-control': 'no-store' })
 * // => { 'cache-control': 'no-cache, no-store' }
 * ```
 *
 * @tags headers, http, normalize, lowercase, request, response, fetch, node, merge, case-insensitive
 * @see compact - @ontologyio/receta/object, drops the null and undefined headers
 */
export function normalizeHeaders(headers: NormalizeHeadersInput): Record<string, string> {
  return R.pipe(
    compact(headers as PlainObject) as Record<string, HeaderValue>,
    R.entries(),
    R.flatMap(toPairs),
    R.groupBy(R.first()),
    R.mapValues(joinValues),
  )
}
