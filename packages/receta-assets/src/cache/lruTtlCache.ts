import * as R from 'remeda'
import { lruCache, type Cache } from '@ontologyio/receta/memo'
import { filter, isNone, isSome, map, type Option } from '@ontologyio/receta/option'

export type LruTtlCacheOptions = {
  /** Keep at most this many entries, dropping the least recently used. */
  readonly maxEntries: number
  /** How long an entry lives after it is set. */
  readonly ttlMs: number
  /** The clock, such as `Date.now`. A test passes a fake one. */
  readonly now: () => number
}

/**
 * Creates a Receta Cache with both a size limit that drops the least recently used entry and an expiry per entry.
 *
 * Use when: memoized data must stay both bounded and fresh, such as exchange rates, user
 * permissions or rendered fragments, where `lruCache` alone keeps old values forever and
 * `ttlCache` alone grows without limit. `memoize`'s own `maxSize` plus `ttl` drops the
 * oldest entry instead of the least used one. Pass it as `cache` to `memoize`,
 * `memoizeBy` or `memoizeAsync`.
 *
 * @example
 * ```ts
 * let time = 0
 * const rates = lruTtlCache<string, number>({ maxEntries: 2, ttlMs: 1000, now: () => time })
 *
 * rates.set('EUR', 0.92)
 * rates.set('JPY', 151)
 * rates.get('EUR')
 * // => Some(0.92)
 *
 * rates.set('GBP', 0.79)
 * rates.get('JPY')
 * // => None
 *
 * time = 1500
 * rates.get('EUR')
 * // => None
 * ```
 *
 * @tags lru, ttl, cache, eviction, expiry, bounded, memory, memoize
 * @see lruCache - @ontologyio/receta/memo, the size limit underneath
 * @see ttlCache - @ontologyio/receta/memo, expiry without a size limit
 */
export function lruTtlCache<K, V>(options: LruTtlCacheOptions): Cache<K, V> {
  type Entry = { readonly value: V; readonly expiresAt: number }
  const entries = lruCache<K, Entry>(options.maxEntries)
  const forEachEntry = entries.forEach?.bind(entries)
  const isFresh = (entry: Entry): boolean => options.now() < entry.expiresAt

  const read = (key: K): Option<V> => {
    const entry = entries.get(key)
    const fresh = R.pipe(entry, filter(isFresh))
    // An expired entry goes as soon as it is seen, so it stops taking a slot.
    if (isSome(entry) && isNone(fresh)) entries.delete(key)
    return R.pipe(
      fresh,
      map((found) => found.value),
    )
  }

  return {
    get: read,
    has: (key) => isSome(read(key)),
    set: (key, value) => entries.set(key, { value, expiresAt: options.now() + options.ttlMs }),
    delete: (key) => entries.delete(key),
    clear: () => entries.clear(),
    forEach: (callback) =>
      forEachEntry?.((entry, key) => {
        if (isFresh(entry)) callback(entry.value, key)
      }),
  }
}
