import * as R from 'remeda'
import { flatMap, fromNullable, map, tryCatch, type Option } from '@ontologyio/receta/option'

export type ParseBasicAuthCredentials = {
  readonly username: string
  readonly password: string
}

const BASIC = /^\s*basic\s+([A-Za-z0-9+/]+={0,2})\s*$/i
/** The first colon splits; a password may contain more colons. */
const USER_PASS = /^([^:]*):(.*)$/s

const decodeBase64Utf8 = (encoded: string): string =>
  new TextDecoder('utf-8', { fatal: true }).decode(
    Uint8Array.from(atob(encoded), (char) => char.charCodeAt(0)),
  )

/**
 * Reads the username and password from an `Authorization: Basic …` header, as Some(credentials) or None.
 *
 * Use when: protecting a staging site, an admin route, a metrics endpoint or a webhook with
 * HTTP Basic auth, where any malformed header should lead to the same 401 with a
 * `WWW-Authenticate` challenge. The scheme ignores case, the credentials are decoded as
 * UTF-8, and the password may contain colons. Bad Base64, bad UTF-8 or a missing colon is
 * None. Compare the password in constant time when you check it.
 *
 * @example
 * ```ts
 * parseBasicAuth('Basic YWRhOnMzY3JldDp3aXRoOmNvbG9ucw==')
 * // => Some({ username: 'ada', password: 's3cret:with:colons' })
 *
 * parseBasicAuth('basic ' + btoa('grace:'))
 * // => Some({ username: 'grace', password: '' })
 *
 * parseBasicAuth('Basic not-base64!')
 * // => None
 *
 * parseBasicAuth('Bearer abc123')
 * // => None
 * ```
 *
 * @tags auth, basic auth, authorization, header, username, password, credentials, middleware
 * @see parseBearerToken - the `Bearer` scheme's token
 * @see tryCatch - @ontologyio/receta/option, turns a decoding throw into None
 */
export function parseBasicAuth(
  header: string | null | undefined,
): Option<ParseBasicAuthCredentials> {
  return R.pipe(
    fromNullable(header),
    flatMap((value) => fromNullable(BASIC.exec(value))),
    flatMap(([, encoded = '']) => tryCatch(() => decodeBase64Utf8(encoded))),
    flatMap((decoded) => fromNullable(USER_PASS.exec(decoded))),
    map(([, username = '', password = '']) => ({ username, password })),
  )
}
