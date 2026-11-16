import * as R from 'remeda'
import { fromNullable, partition } from '@ontologyio/receta/option'
import { tryCatch, unwrapOr } from '@ontologyio/receta/result'

/** A name that doesn't start with a space, `=`, then the value. */
const PAIR = /^\s*([^=\s][^=]*?)\s*=\s*(.*?)\s*$/s
const QUOTED = /^"(.*)"$/s

const decodeLenient = (value: string): string =>
  unwrapOr(
    tryCatch(() => decodeURIComponent(value)),
    value,
  )

/**
 * Reads a `Cookie` request header into a record of names and decoded values, skipping anything malformed.
 *
 * Use when: a server, middleware or edge function needs one cookie, such as a session id, a
 * theme or a consent flag, without a cookie library. Values are percent-decoded when they can
 * be and kept as sent when they can't, surrounding double quotes are removed, and parts
 * without `=` are ignored, as browsers do. When a name appears twice, the first wins, since
 * browsers send the cookie with the more specific path first. A missing header is `{}`.
 *
 * @example
 * ```ts
 * parseCookieHeader('session=abc123; theme=dark; note=caf%C3%A9; flag; theme=light')
 * // => { session: 'abc123', theme: 'dark', note: 'café' }
 *
 * parseCookieHeader('quoted="a b"; broken=%E0%A4%A')
 * // => { quoted: 'a b', broken: '%E0%A4%A' }
 *
 * parseCookieHeader(undefined)
 * // => {}
 * ```
 *
 * @tags cookie, header, session, request, http, middleware, parse cookies
 * @see parseKeyValuePairs - the strict reading, where a bad pair is an error
 * @see tryCatch - @ontologyio/receta/result, keeps a value whose escape is broken
 */
export function parseCookieHeader(header: string | null | undefined): Readonly<Record<string, string>> {
  const [pairs] = R.pipe(
    R.split(header ?? '', ';'),
    R.map((part) => fromNullable(PAIR.exec(part))),
    (matches) => partition(matches),
  )
  return R.pipe(
    pairs,
    R.map(([, name = '', raw = '']): [string, string] => [name, decodeLenient(raw.replace(QUOTED, '$1'))]),
    R.uniqueBy(([name]) => name),
    R.fromEntries(),
  )
}
