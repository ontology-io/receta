import type { Cache } from '@ontologyio/receta/memo'
import { match } from '@ontologyio/receta/option'

/**
 * Returns the cached value for a key, or computes it, stores it and returns it: the cache-aside read for a Receta Cache.
 *
 * Use when: code holds a cache directly instead of memoizing one function, such as one
 * `lruCache` shared by several call sites, or a per-request cache where the computation
 * closes over the request. Works with any Receta `Cache`, so `ttlCache` and `lruCache`
 * keep their expiry and eviction. `compute` runs only on a miss.
 *
 * @example
 * ```ts
 * import { lruCache } from '@ontologyio/receta/memo'
 *
 * const thumbnails = lruCache<string, string>(100)
 * let renders = 0
 * const render = (path: string) => {
 *   renders += 1
 *   return `${path}@128px`
 * }
 *
 * getOrCompute(thumbnails, 'cat.png', render)
 * // => 'cat.png@128px'
 *
 * getOrCompute(thumbnails, 'cat.png', render)
 * // => 'cat.png@128px'
 *
 * renders
 * // => 1
 * ```
 *
 * @tags cache aside, read through, get or set, compute, lazy, lru
 * @see getOrLoad - the same for an async load, sharing it between concurrent callers
 * @see lruCache - @ontologyio/receta/memo, one of the caches it works with
 */
export function getOrCompute<K, V>(cache: Cache<K, V>, key: K, compute: (key: K) => V): V {
  return match(cache.get(key), {
    onSome: (value) => value,
    onNone: () => {
      const value = compute(key)
      cache.set(key, value)
      return value
    },
  })
}
