import type { MemoizedFunction, MemoizedAsyncFunction } from '../types'

/**
 * Clears the cache of a memoized function.
 *
 * @example
 * ```typescript
 * import { memoize, clearCache } from 'receta/memo'
 *
 * const expensive = memoize((n: number) => fibonacci(n))
 *
 * expensive(40) // computed
 * expensive(40) // cached
 *
 * clearCache(expensive)
 *
 * expensive(40) // computed again
 *
 * // Alternative: use .clear() method
 * expensive.clear()
 * ```
 */
export function clearCache<Args extends readonly unknown[], R>(
  memoized: MemoizedFunction<Args, R> | MemoizedAsyncFunction<Args, R>
): void {
  memoized.clear()
}
