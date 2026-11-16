import * as R from 'remeda'
import { descending } from '@ontologyio/receta/compare'

/**
 * Returns the n items with the highest score, highest first, with equal scores kept in input order.
 *
 * Use when: showing a leaderboard, the top 5 products by revenue or the slowest endpoints,
 * where equal scores must come out in the same order every time. Unlike `R.takeFirstBy`, ties
 * keep their input order. Asking for more items than there are returns them all, and an `n`
 * of 0 or less returns an empty list.
 *
 * @example
 * ```ts
 * const products = [
 *   { name: 'mug', sold: 40 },
 *   { name: 'tee', sold: 75 },
 *   { name: 'cap', sold: 40 },
 *   { name: 'pin', sold: 12 },
 * ]
 *
 * topNBy(products, 2, (product) => product.sold)
 * // => [{ name: 'tee', sold: 75 }, { name: 'mug', sold: 40 }]
 *
 * R.pipe(products, topNBy(3, (product) => product.sold), R.map(R.prop('name')))
 * // => ['tee', 'mug', 'cap']
 *
 * topNBy(products, 0, (product) => product.sold)
 * // => []
 * ```
 *
 * @tags top, highest, largest, best, max, leaderboard, ranking, limit, top-n
 * @see bottomNBy - the n lowest instead
 * @see descending - @ontologyio/receta/compare, the highest-first order
 */
export function topNBy<T>(items: readonly T[], n: number, score: (item: T) => number): readonly T[]
export function topNBy<T>(n: number, score: (item: T) => number): (items: readonly T[]) => readonly T[]
export function topNBy(...args: unknown[]): unknown {
  return R.purry(topNByImplementation, args)
}

const topNByImplementation = <T>(items: readonly T[], n: number, score: (item: T) => number): readonly T[] =>
  // R.sort is stable, so items with the same score stay in the order they came in.
  R.pipe(items, R.sort(descending(score)), R.take(Math.max(0, n)))
