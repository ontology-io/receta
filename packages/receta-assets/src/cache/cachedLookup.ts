import { memoizeAsync, ttlCache } from '@ontologyio/receta/memo'
import { isSome, match, none, type Option } from '@ontologyio/receta/option'
import { isOk, ok, tryCatchAsync, type Result } from '@ontologyio/receta/result'

export type CachedLookupOptions = {
  /** How long a found value is kept. */
  readonly hitTtlMs: number
  /** How long "not found" is kept, usually much shorter, so new data shows up soon. */
  readonly missTtlMs: number
}

export type CachedLookupError = {
  readonly code: 'LOOKUP_FAILED'
  readonly key: string
  readonly error: unknown
  readonly message: string
}

/**
 * Caches an async lookup that may find nothing, keeping what it found and what it didn't find for different times.
 *
 * Use when: lookups often miss, such as accounts by email at sign-in, short links, or SKUs
 * from a scanner, and every miss going to the database is the expensive part. A miss is kept
 * briefly, so a flood of lookups for a missing key costs one query, and a key created a
 * moment later still shows up soon. A failed lookup isn't kept at all.
 *
 * @example
 * ```ts
 * import { sleep } from '@ontologyio/receta/async'
 * import { fromNullable } from '@ontologyio/receta/option'
 *
 * const accounts = new Map([['ada@mail.io', 'u1']])
 * let queries = 0
 * const findAccount = async (email: string) => {
 *   queries += 1
 *   return fromNullable(accounts.get(email))
 * }
 * const lookupAccount = cachedLookup(findAccount, { hitTtlMs: 60_000, missTtlMs: 5 })
 *
 * await lookupAccount('ada@mail.io')
 * // => Ok(Some('u1'))
 *
 * await lookupAccount('bo@mail.io')
 * await lookupAccount('bo@mail.io')
 * // => Ok(None)
 *
 * queries
 * // => 2
 *
 * accounts.set('bo@mail.io', 'u2')
 * await sleep(10)
 * await lookupAccount('bo@mail.io')
 * // => Ok(Some('u2'))
 * ```
 *
 * @tags negative cache, miss, not found, lookup, ttl, cache penetration, database
 * @see memoizeSomeOnly - a sync lookup that keeps what it found and nothing else
 * @see ttlCache - @ontologyio/receta/memo, one for hits and one for misses
 */
export function cachedLookup<V>(
  lookup: (key: string) => Promise<Option<V>>,
  options: CachedLookupOptions,
): (key: string) => Promise<Result<Option<V>, CachedLookupError>> {
  const hits = ttlCache<string, V>(options.hitTtlMs)
  const misses = ttlCache<string, true>(options.missTtlMs)
  // Shares one lookup per key while it runs; the two caches keep what it found.
  const inFlight = memoizeAsync(lookup)

  return async (key) => {
    const hit = hits.get(key)
    if (isSome(hit)) return ok(hit)
    if (misses.has(key)) return ok(none())
    const looked = await tryCatchAsync(
      () => inFlight(key),
      (error): CachedLookupError => ({ code: 'LOOKUP_FAILED', key, error, message: `Looking up "${key}" failed` }),
    )
    inFlight.cache.delete(key)
    if (isOk(looked)) {
      match(looked.value, { onSome: (value) => hits.set(key, value), onNone: () => misses.set(key, true) })
    }
    return looked
  }
}
