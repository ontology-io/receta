import { memoize as memoizeImpl } from '../../memo/memoize'

/**
 * Creates a memoized version of a function that caches its results.
 *
 * This is a simple re-export of the `memo` module's `memoize` function,
 * provided here for convenience in the function module.
 *
 * By default, uses the first argument as the cache key. For custom cache keys,
 * use `memo.memoizeBy` instead.
 *
 * @example
 * ```typescript
 * const fibonacci = memoize((n: number): number => {
 *   if (n <= 1) return n
 *   return fibonacci(n - 1) + fibonacci(n - 2)
 * })
 *
 * fibonacci(40)  // Computed once
 * fibonacci(40)  // Returned from cache instantly
 * ```
 *
 * @example
 * ```typescript
 * // Memoizing expensive computations
 * const expensiveCalc = memoize((data: string) => {
 *   console.log('Computing...')
 *   return data.split('').reverse().join('')
 * })
 *
 * expensiveCalc('hello')  // Logs "Computing...", returns "olleh"
 * expensiveCalc('hello')  // Returns "olleh" (no log, cached)
 * expensiveCalc('world')  // Logs "Computing...", returns "dlrow"
 * ```
 *
 * @example
 * ```typescript
 * // For custom cache keys, use memo.memoizeBy
 * import { memoizeBy } from 'receta/memo'
 *
 * const fetchUser = memoizeBy(
 *   (id: string) => fetch(`/api/users/${id}`).then(r => r.json()),
 *   (id) => id  // Cache key function
 * )
 * ```
 *
 * @see memo.memoize - Original implementation with more options
 * @see memo.memoizeBy - For custom cache key generation
 * @see memo.memoizeAsync - For Promise-based memoization
 */
export const memoize = memoizeImpl
