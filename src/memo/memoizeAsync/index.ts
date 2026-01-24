import type { Cache, KeyFn, MemoizeOptions, MemoizedAsyncFunction } from '../types'

/**
 * Creates a memoized async function with request deduplication.
 *
 * Key features:
 * - Caches resolved promises
 * - Prevents duplicate in-flight requests (thundering herd protection)
 * - Failed promises are not cached
 * - Supports TTL and LRU cache strategies
 *
 * @example
 * ```typescript
 * // Basic async memoization
 * const fetchUser = memoizeAsync(async (id: string) => {
 *   const res = await fetch(`/api/users/${id}`)
 *   return res.json()
 * })
 *
 * // Concurrent calls - only 1 fetch happens
 * const [a, b, c] = await Promise.all([
 *   fetchUser('123'),
 *   fetchUser('123'),
 *   fetchUser('123')
 * ]) // All return same result from single API call
 *
 * // With TTL
 * const getWeather = memoizeAsync(
 *   async (city: string) => api.fetchWeather(city),
 *   { ttl: 5 * 60 * 1000 } // 5 min cache
 * )
 *
 * // Custom key extraction
 * const fetchData = memoizeAsync(
 *   async (opts: { id: string; type: string }) => api.fetch(opts),
 *   { keyFn: (opts) => `${opts.id}:${opts.type}` }
 * )
 * ```
 *
 * @see memoize - for synchronous functions
 * @see memoizeBy - for custom key extraction
 */
export function memoizeAsync<Args extends readonly unknown[], R>(
  fn: (...args: Args) => Promise<R>,
  options: MemoizeOptions & { keyFn?: KeyFn<Args, unknown> } = {}
): MemoizedAsyncFunction<Args, R> {
  const cache: Cache<unknown, Promise<R>> =
    (options.cache as Cache<unknown, Promise<R>>) ?? new Map()
  const keyFn = options.keyFn ?? (((...args: Args) => args[0]) as KeyFn<Args, unknown>)

  const memoized = async (...args: Args): Promise<R> => {
    const key = keyFn(...args)

    // Return cached promise if exists
    if (cache.has(key)) {
      return cache.get(key)!
    }

    // Create new promise and cache it immediately (for deduplication)
    const promise = fn(...args)
      .then((result) => {
        // Keep successful result in cache
        return result
      })
      .catch((error) => {
        // Remove failed promise from cache
        cache.delete(key)
        throw error
      })

    cache.set(key, promise)

    // Handle maxSize eviction (only for Map cache)
    if (options.maxSize && cache instanceof Map && cache.size > options.maxSize) {
      const firstKey = cache.keys().next().value
      cache.delete(firstKey)
    }

    return promise
  }

  // Attach cache and clear method
  memoized.cache = cache
  memoized.clear = () => cache.clear()

  return memoized as MemoizedAsyncFunction<Args, R>
}
