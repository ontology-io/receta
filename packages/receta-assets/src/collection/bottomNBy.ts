import * as R from 'remeda'
import { ascending } from '@ontologyio/receta/compare'

/**
 * Returns the n items with the lowest score, lowest first, with equal scores kept in input order.
 *
 * Use when: finding the cheapest offers, the fastest responses or the least-used features,
 * where equal scores must come out in the same order every time. Unlike `R.takeFirstBy`, ties
 * keep their input order. Asking for more items than there are returns them all, and an `n`
 * of 0 or less returns an empty list.
 *
 * @example
 * ```ts
 * const offers = [
 *   { shop: 'north', price: 19 },
 *   { shop: 'east', price: 12 },
 *   { shop: 'west', price: 12 },
 *   { shop: 'south', price: 25 },
 * ]
 *
 * bottomNBy(offers, 2, (offer) => offer.price)
 * // => [{ shop: 'east', price: 12 }, { shop: 'west', price: 12 }]
 *
 * R.pipe(offers, bottomNBy(3, (offer) => offer.price), R.map(R.prop('shop')))
 * // => ['east', 'west', 'north']
 *
 * bottomNBy([], 5, (offer: { price: number }) => offer.price)
 * // => []
 * ```
 *
 * @tags bottom, lowest, smallest, cheapest, min, fastest, limit, bottom-n
 * @see topNBy - the n highest instead
 * @see ascending - @ontologyio/receta/compare, the lowest-first order
 */
export function bottomNBy<T>(items: readonly T[], n: number, score: (item: T) => number): readonly T[]
export function bottomNBy<T>(n: number, score: (item: T) => number): (items: readonly T[]) => readonly T[]
export function bottomNBy(...args: unknown[]): unknown {
  return R.purry(bottomNByImplementation, args)
}

const bottomNByImplementation = <T>(items: readonly T[], n: number, score: (item: T) => number): readonly T[] =>
  // R.sort is stable, so items with the same score stay in the order they came in.
  R.pipe(items, R.sort(ascending(score)), R.take(Math.max(0, n)))
