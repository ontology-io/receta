import { unwrap, some, none } from '../../option'
import type { Cache, KeyFn, MemoizeOptions, MemoizedFunction } from '../types'

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
  // Wrap Map to return Option values
  const defaultCache = (): Cache<K, R> & { forEach?: Map<K, R>['forEach'] } => {
    const map = new Map<K, R>()
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

  const cache: Cache<K, R> = (options.cache as Cache<K, R>) ?? defaultCache()

  const memoized = (...args: Args): R => {
    const key = keyFn(...args)

    if (cache.has(key)) {
      return unwrap(cache.get(key))
    }

    const result = fn(...args)
    cache.set(key, result)

    return result
  }

  // Attach cache and clear method
  memoized.cache = cache as Cache<unknown, R>
  memoized.clear = () => cache.clear()

  return memoized as MemoizedFunction<Args, R>
}
