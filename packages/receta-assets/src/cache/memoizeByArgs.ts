import { lruCache, memoizeBy, type MemoizedFunction } from '@ontologyio/receta/memo'

export type MemoizeByArgsOptions = {
  /** Keep at most this many results, dropping the least recently used. Defaults to no limit. */
  readonly maxEntries?: number
}

/**
 * Memoizes a function on all of its arguments, compared as JSON, with an optional LRU size limit.
 *
 * Use when: a pure function takes several arguments, such as `shippingCost(country,
 * weight)` or `price(sku, currency, quantity)`. `memoize` keys on the first argument only,
 * so a second call with the same first argument would return the first call's answer.
 * Arguments must be JSON data: functions, symbols and class instances don't survive, and
 * `undefined` and `null` count as the same inside the key.
 *
 * @example
 * ```ts
 * let computed = 0
 * const shippingCost = (country: string, weightKg: number) => {
 *   computed += 1
 *   return country === 'DE' ? weightKg * 2 : weightKg * 5
 * }
 * const cachedCost = memoizeByArgs(shippingCost, { maxEntries: 500 })
 *
 * cachedCost('DE', 3)
 * // => 6
 *
 * cachedCost('DE', 10)
 * // => 20
 *
 * cachedCost('DE', 3)
 * // => 6
 *
 * computed
 * // => 2
 * ```
 *
 * @tags memoize, arguments, multiple args, json key, lru, pure function, cache
 * @see memoizeBy - @ontologyio/receta/memo, memoizes with a key function you write
 * @see lruCache - @ontologyio/receta/memo, the size limit
 */
export function memoizeByArgs<A extends readonly unknown[], T>(
  fn: (...args: A) => T,
  options: MemoizeByArgsOptions = {},
): MemoizedFunction<A, T> {
  const keyOf = (...args: A): string => JSON.stringify(args)
  const limit = options.maxEntries === undefined ? {} : { cache: lruCache<string, unknown>(options.maxEntries) }
  return memoizeBy(fn, keyOf, limit)
}
