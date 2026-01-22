import type { Cache, KeyFn, MemoizeOptions, MemoizedFunction } from './types'

/**
 * Creates a memoized function with custom key extraction.
 *
 * Use this when:
 * - Function takes multiple arguments
 * - Function takes complex objects as arguments
 * - You need custom cache key logic
 *
 * @example
 * ```typescript
 * // Multi-argument function
 * const add = (a: number, b: number) => a + b
 * const memoAdd = memoizeBy(add, (a, b) => `${a},${b}`)
 *
 * memoAdd(2, 3) // computed
 * memoAdd(2, 3) // cached
 *
 * // Complex object arguments
 * interface FetchOptions {
 *   id: string
 *   include?: string[]
 * }
 *
 * const fetchUser = memoizeBy(
 *   (opts: FetchOptions) => api.fetch(opts),
 *   (opts) => JSON.stringify(opts)
 * )
 *
 * // Object key (use with WeakMap cache)
 * const processNode = memoizeBy(
 *   (node: Node) => expensiveOperation(node),
 *   (node) => node // object as key
 * )
 * ```
 *
 * @see memoize - for single-argument functions
 * @see memoizeAsync - for async functions
 */
export function memoizeBy<Args extends readonly unknown[], R, K>(
  fn: (...args: Args) => R,
  keyFn: KeyFn<Args, K>,
  options: MemoizeOptions<K> = {}
): MemoizedFunction<Args, R> {
  const cache: Cache<K, R> = (options.cache as Cache<K, R>) ?? new Map()

  const memoized = (...args: Args): R => {
    const key = keyFn(...args)

    if (cache.has(key)) {
      return cache.get(key)!
    }

    const result = fn(...args)
    cache.set(key, result)

    // Handle maxSize eviction (only for Map cache)
    if (options.maxSize && cache instanceof Map && cache.size > options.maxSize) {
      const firstKey = cache.keys().next().value
      cache.delete(firstKey)
    }

    return result
  }

  // Attach cache and clear method
  memoized.cache = cache as Cache<unknown, R>
  memoized.clear = () => cache.clear()

  return memoized as MemoizedFunction<Args, R>
}
