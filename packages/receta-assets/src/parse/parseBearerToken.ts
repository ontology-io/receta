import * as R from 'remeda'
import { flatMap, fromNullable, map, type Option } from '@ontologyio/receta/option'

const BEARER = /^\s*bearer\s+(\S+)\s*$/i

/**
 * Takes the token out of an `Authorization: Bearer <token>` header, as Some(token) or None.
 *
 * Use when: an API route, middleware or edge function authenticates with a bearer token and
 * a missing, empty or differently-schemed header should all lead to the same 401. The
 * scheme ignores case and extra spaces, as HTTP allows. The token isn't checked; verify it
 * next, for example as a JWT or against a session store.
 *
 * @example
 * ```ts
 * parseBearerToken('Bearer eyJhbGciOiJIUzI1NiJ9.e30.sig')
 * // => Some('eyJhbGciOiJIUzI1NiJ9.e30.sig')
 *
 * parseBearerToken('bearer   abc123 ')
 * // => Some('abc123')
 *
 * parseBearerToken('Basic YWRhOnMzY3JldA==')
 * // => None
 *
 * parseBearerToken(undefined)
 * // => None
 * ```
 *
 * @tags auth, authorization, bearer, token, header, jwt, api key, middleware
 * @see parseBasicAuth - the `Basic` scheme's username and password
 * @see fromNullable - @ontologyio/receta/option, a missing header is None
 */
export function parseBearerToken(header: string | null | undefined): Option<string> {
  return R.pipe(
    fromNullable(header),
    flatMap((value) => fromNullable(BEARER.exec(value))),
    map(([, token = '']) => token),
  )
}
