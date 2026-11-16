import { memoizeBy, type MemoizedFunction } from '@ontologyio/receta/memo'
import { isNone, type Option } from '@ontologyio/receta/option'

/**
 * Memoizes a function that returns an Option, keeping what it found and looking again next time when it found nothing.
 *
 * Use when: a lookup against data that fills up over time, such as a directory being
 * synced, a registry plugins add to, or a store being hydrated, where "not there" now may
 * be "there" in a second but a value found stays valid. Plain `memoize` would keep the
 * first `None` forever. The key defaults to the first argument; pass `keyOf` when the
 * function takes more than one. The result has the memoized function's `cache` and `clear`.
 *
 * @example
 * ```ts
 * import { fromNullable } from '@ontologyio/receta/option'
 *
 * const directory = new Map<string, string>()
 * let lookups = 0
 * const userIdFor = (email: string) => {
 *   lookups += 1
 *   return fromNullable(directory.get(email))
 * }
 * const cachedUserId = memoizeSomeOnly(userIdFor)
 *
 * cachedUserId('ada@mail.io')
 * // => None
 *
 * directory.set('ada@mail.io', 'u1')
 * cachedUserId('ada@mail.io')
 * // => Some('u1')
 *
 * cachedUserId('ada@mail.io')
 * // => Some('u1')
 *
 * lookups
 * // => 2
 * ```
 *
 * @tags memoize, option, cache hits, miss, some only, lookup, directory
 * @see memoizeOkOnly - the same for functions that return a Result
 * @see cachedLookup - an async lookup that keeps misses too, for a shorter time
 */
export function memoizeSomeOnly<A extends readonly unknown[], T>(
  fn: (...args: A) => Option<T>,
  keyOf: (...args: A) => unknown = (...args) => args[0],
): MemoizedFunction<A, Option<T>> {
  const memoized = memoizeBy(fn, keyOf)
  const someOnly = (...args: A): Option<T> => {
    const found = memoized(...args)
    // Nothing found may change soon, so it is dropped and the next call looks again.
    if (isNone(found)) memoized.cache.delete(keyOf(...args))
    return found
  }
  return Object.assign(someOnly, { cache: memoized.cache, clear: memoized.clear })
}
