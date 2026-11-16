import { memoizeBy, type MemoizedFunction } from '@ontologyio/receta/memo'
import { isErr, type Result } from '@ontologyio/receta/result'

/**
 * Memoizes a function that returns a Result, keeping Ok results and computing an Err again on the next call.
 *
 * Use when: a lookup or computation can fail for a reason that may pass, such as a rate
 * not loaded yet, a template not registered yet, or a quota that resets, while a success
 * stays true. Plain `memoize` would keep returning the first Err forever. The key defaults
 * to the first argument; pass `keyOf` when the function takes more than one. The result has
 * the memoized function's `cache` and `clear`.
 *
 * @example
 * ```ts
 * import { fromNullable } from '@ontologyio/receta/result'
 *
 * const rates = new Map<string, number>()
 * let lookups = 0
 * const rateFor = (currency: string) => {
 *   lookups += 1
 *   return fromNullable(rates.get(currency), `no rate for ${currency} yet`)
 * }
 * const cachedRate = memoizeOkOnly(rateFor)
 *
 * cachedRate('EUR')
 * // => Err('no rate for EUR yet')
 *
 * rates.set('EUR', 0.92)
 * cachedRate('EUR')
 * // => Ok(0.92)
 *
 * cachedRate('EUR')
 * // => Ok(0.92)
 *
 * lookups
 * // => 2
 * ```
 *
 * @tags memoize, result, cache success, retry failure, ok only, lookup
 * @see memoizeSomeOnly - the same for functions that return an Option
 * @see memoizeBy - @ontologyio/receta/memo, the cache underneath, which keeps every result
 */
export function memoizeOkOnly<A extends readonly unknown[], T, E>(
  fn: (...args: A) => Result<T, E>,
  keyOf: (...args: A) => unknown = (...args) => args[0],
): MemoizedFunction<A, Result<T, E>> {
  const memoized = memoizeBy(fn, keyOf)
  const okOnly = (...args: A): Result<T, E> => {
    const result = memoized(...args)
    // A failure may not last, so it is dropped and the next call computes it again.
    if (isErr(result)) memoized.cache.delete(keyOf(...args))
    return result
  }
  return Object.assign(okOnly, { cache: memoized.cache, clear: memoized.clear })
}
