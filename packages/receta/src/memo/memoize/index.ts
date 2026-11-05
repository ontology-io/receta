import { isSome } from '../../option'
import type { Cache, MemoizeOptions, MemoizedFunction } from '../types'
import { boundedCache } from '../caches/boundedCache'
import { lookup } from '../caches/lookup'

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
 * const getWeather = memoize(fetchWeather, { cache: ttlCache(5 * 60 * 1000) }) // 5 min
 * ```
 *
 * @see memoizeBy - for custom key extraction
 * @see memoizeAsync - for async functions with deduplication
 */
export function memoize<Args extends readonly [unknown, ...unknown[]], R>(
  fn: (...args: Args) => R,
  options: MemoizeOptions = {}
): MemoizedFunction<Args, R> {
  const cache: Cache<unknown, R> = (options.cache as Cache<unknown, R>) ?? boundedCache(options)

  const memoized = (...args: Args): R => {
    // Use first argument as cache key
    const key = args[0]

    const cached = lookup(cache, key)
    if (isSome(cached)) return cached.value

    const result = fn(...args)
    cache.set(key, result)

    return result
  }

  // Attach cache and clear method
  memoized.cache = cache
  memoized.clear = () => cache.clear()

  return memoized as MemoizedFunction<Args, R>
}
