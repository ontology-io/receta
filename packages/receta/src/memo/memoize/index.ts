import { unwrap, fromNullable, some, none } from '../../option'
import type { Cache, MemoizeOptions, MemoizedFunction } from '../types'

/**
 * Creates a memoized version of a function that caches results based on arguments.
 *
 * By default, uses a simple Map cache with the first argument as the key.
 * For multi-argument functions or complex keys, use `memoizeBy()` instead.
 *
 * @example
 * ```typescript
 * // Basic memoization
 * const fibonacci = (n: number): number => {
 *   if (n <= 1) return n
 *   return fibonacci(n - 1) + fibonacci(n - 2)
 * }
 *
 * const memoFib = memoize(fibonacci)
 * memoFib(40) // computed (takes time)
 * memoFib(40) // cached (instant)
 *
 * // With max size
 * const getUser = memoize(fetchUser, { maxSize: 100 })
 *
 * // With TTL
 * const getWeather = memoize(fetchWeather, { ttl: 5 * 60 * 1000 }) // 5 min
 * ```
 *
 * @see memoizeBy - for custom key extraction
 * @see memoizeAsync - for async functions with deduplication
 */
export function memoize<Args extends readonly [unknown, ...unknown[]], R>(
  fn: (...args: Args) => R,
  options: MemoizeOptions = {}
): MemoizedFunction<Args, R> {
  // Wrap Map to return Option values
  const defaultCache = (): Cache<unknown, R> & { forEach?: Map<unknown, R>['forEach'] } => {
    const map = new Map<unknown, R>()
    return {
      get: (key) => (map.has(key) ? some(map.get(key) as R) : none()),
      set: (key, value) => {
        map.set(key, value)
        // Handle maxSize eviction
        if (options.maxSize && map.size > options.maxSize) {
          const firstKey = map.keys().next().value
          if (firstKey !== undefined) {
            map.delete(firstKey)
          }
        }
      },
      has: (key) => map.has(key),
      delete: (key) => map.delete(key),
      clear: () => map.clear(),
      // Add forEach for invalidateWhere support
      forEach: map.forEach.bind(map) as any,
    }
  }

  const cache: Cache<unknown, R> = (options.cache as Cache<unknown, R>) ?? defaultCache()

  const memoized = (...args: Args): R => {
    // Use first argument as cache key
    const key = args[0]

    if (cache.has(key)) {
      return unwrap(cache.get(key))
    }

    const result = fn(...args)
    cache.set(key, result)

    return result
  }

  // Attach cache and clear method
  memoized.cache = cache
  memoized.clear = () => cache.clear()

  return memoized as MemoizedFunction<Args, R>
}
