import * as R from 'remeda'
import type { Cache } from '@ontologyio/receta/memo'
import { tap, tapNone } from '@ontologyio/receta/option'
import { ratio } from '@ontologyio/receta/number'

export type CacheWithStatsCounts = {
  readonly hits: number
  readonly misses: number
  /** hits / (hits + misses), or 0 before any lookup. */
  readonly hitRate: number
}

export type CacheWithStats<K, V> = {
  /** The same cache, counting its lookups. Pass it wherever the original went. */
  readonly cache: Cache<K, V>
  readonly stats: () => CacheWithStatsCounts
  readonly resetStats: () => void
}

/**
 * Wraps a Receta Cache so it counts hits and misses, to measure whether a cache's size and expiry are right.
 *
 * Use when: tuning a cache or reporting on one, such as sending the hit rate of a user
 * cache to metrics every minute, or checking in a test that a memoized call was really
 * served from the cache. Pass the wrapped cache to `memoize`, `memoizeBy` or `memoizeAsync`
 * as `cache`. A miss is a `has` or `get` that finds nothing, a hit is a `get` that finds a
 * value, which is how memoize asks.
 *
 * @example
 * ```ts
 * import { lruCache, memoize } from '@ontologyio/receta/memo'
 *
 * const { cache, stats } = cacheWithStats(lruCache<string, unknown>(100))
 * const greet = memoize((name: string) => `Hello, ${name}`, { cache })
 *
 * greet('Ada')
 * greet('Ada')
 * greet('Ada')
 * greet('Ada')
 * // => 'Hello, Ada'
 *
 * stats()
 * // => { hits: 3, misses: 1, hitRate: 0.75 }
 * ```
 *
 * @tags cache, metrics, hit rate, stats, observability, tuning, monitoring
 * @see lruTtlCache - a cache to wrap, with a size limit and an expiry
 * @see ratio - @ontologyio/receta/number, the hit rate without dividing by zero
 */
export function cacheWithStats<K, V>(cache: Cache<K, V>): CacheWithStats<K, V> {
  let hits = 0
  let misses = 0
  // Bound, since a cache's forEach may use `this`.
  const forEachEntry = cache.forEach?.bind(cache)
  const countHit = () => {
    hits += 1
  }
  const countMiss = () => {
    misses += 1
  }

  const counted: Cache<K, V> = {
    get: (key) => R.pipe(cache.get(key), tap(countHit), tapNone(countMiss)),
    has: (key) => {
      const present = cache.has(key)
      if (!present) countMiss()
      return present
    },
    set: (key, value) => cache.set(key, value),
    delete: (key) => cache.delete(key),
    clear: () => cache.clear(),
    // invalidateWhere needs forEach, so it is kept when the cache has it.
    ...(forEachEntry === undefined ? {} : { forEach: forEachEntry }),
  }

  return {
    cache: counted,
    stats: () => ({ hits, misses, hitRate: ratio(hits, hits + misses) }),
    resetStats: () => {
      hits = 0
      misses = 0
    },
  }
}
