import * as R from 'remeda'
import { clearCache, memoizeAsync } from '@ontologyio/receta/memo'
import { filter, isSome, none, some, type Option } from '@ontologyio/receta/option'
import { isOk, ok, tryCatchAsync, type Result } from '@ontologyio/receta/result'

export type CachedUntilExpiryOptions<T> = {
  /** When the value stops being valid, in the same unit as `now`, such as a token's `expires_at`. */
  readonly expiresAt: (value: T) => number
  /** Load a new value this long before the old one expires. Defaults to 0. */
  readonly marginMs?: number
  /** The clock, such as `Date.now`. A test passes a fake one. */
  readonly now: () => number
}

export type CachedUntilExpiryError = {
  readonly code: 'LOAD_FAILED'
  readonly error: unknown
  readonly message: string
}

/**
 * Keeps one async value, such as an access token, until shortly before the expiry it carries, then loads a new one.
 *
 * Use when: a value says when it stops working, such as an OAuth access token, signed URL,
 * temporary cloud credentials or a session, and every call should reuse it until then.
 * `marginMs` replaces it a little early, so a request never leaves with a token that dies
 * on the way. Concurrent calls that find it expired share one load, and a failed load
 * isn't kept.
 *
 * @example
 * ```ts
 * let time = 0
 * let issued = 0
 * const fetchToken = async () => {
 *   issued += 1
 *   return { token: `t${issued}`, expiresAt: 1000 * issued }
 * }
 * const getToken = cachedUntilExpiry(fetchToken, {
 *   expiresAt: (token) => token.expiresAt,
 *   marginMs: 100,
 *   now: () => time,
 * })
 *
 * await getToken()
 * // => Ok({ token: 't1', expiresAt: 1000 })
 *
 * time = 850
 * await getToken()
 * // => Ok({ token: 't1', expiresAt: 1000 })
 *
 * time = 950
 * await getToken()
 * // => Ok({ token: 't2', expiresAt: 2000 })
 * ```
 *
 * @tags token, oauth, access token, expiry, credentials, refresh, session, jwt
 * @see loadOnce - keeps one value until reset, with no expiry
 * @see memoizeAsync - @ontologyio/receta/memo, shares the load between concurrent callers
 */
export function cachedUntilExpiry<T>(
  load: () => Promise<T>,
  options: CachedUntilExpiryOptions<T>,
): () => Promise<Result<T, CachedUntilExpiryError>> {
  let current: Option<T> = none()
  const loading = memoizeAsync(load, { keyFn: () => 'value' })
  const isUsable = (value: T): boolean => options.now() < options.expiresAt(value) - (options.marginMs ?? 0)

  return async () => {
    const usable = R.pipe(current, filter(isUsable))
    if (isSome(usable)) return ok(usable.value)
    const loaded = await tryCatchAsync(
      () => loading(),
      (error): CachedUntilExpiryError => ({ code: 'LOAD_FAILED', error, message: 'Loading a new value failed' }),
    )
    // The value now lives in current, so the next expiry must start a new load.
    clearCache(loading)
    if (isOk(loaded)) current = some(loaded.value)
    return loaded
  }
}
