import * as R from 'remeda'
import { ascending, type Comparator } from '@ontologyio/receta/compare'

export type DedupeByKeepBestResult<T> = {
  /** One item per key, the one that sorts first by the comparator, in input order. */
  readonly kept: readonly T[]
  /** The other copies, in input order. */
  readonly dropped: readonly T[]
}

/**
 * Keeps one item per key, the one that sorts first by a comparator, and returns what it dropped.
 *
 * Use when: several records share a key and a rule picks the winner, such as the cheapest
 * offer per product, the highest version per package or the best score per player. Build
 * the rule from `@ontologyio/receta/compare`: `descending(...)` keeps the largest. On a tie
 * the copy that came first wins. Kept items stay where they stood in the input. Keys compare
 * as strings, so `1` and `'1'` are the same key.
 *
 * @example
 * ```ts
 * import { ascending, descending } from '@ontologyio/receta/compare'
 *
 * const offers = [
 *   { product: 'lamp', shop: 'north', price: 30 },
 *   { product: 'desk', shop: 'north', price: 120 },
 *   { product: 'lamp', shop: 'east', price: 24 },
 * ]
 *
 * dedupeByKeepBest(offers, (offer) => offer.product, ascending((offer) => offer.price))
 * // => {
 * //   kept: [{ product: 'desk', shop: 'north', price: 120 }, { product: 'lamp', shop: 'east', price: 24 }],
 * //   dropped: [{ product: 'lamp', shop: 'north', price: 30 }],
 * // }
 *
 * const scores = [
 *   { player: 'ana', points: 3 },
 *   { player: 'bo', points: 5 },
 *   { player: 'ana', points: 9 },
 * ]
 * R.pipe(
 *   scores,
 *   dedupeByKeepBest((score) => score.player, descending((score) => score.points)),
 *   (result) => R.map(result.kept, (score) => `${score.player} ${score.points}`),
 * )
 * // => ['bo 5', 'ana 9']
 * ```
 *
 * @tags dedupe, best, cheapest, highest, latest, newest, most recent, winner, per key, pick, unique
 * @see dedupeByKeepFirst - the first copy wins
 * @see dedupeByKeepLast - the last copy wins
 * @see latestBy - newest per key by a timestamp, newest first; on a tie the later copy wins
 * @see ascending - @ontologyio/receta/compare, a comparator that keeps the smallest
 */
export function dedupeByKeepBest<T>(
  items: readonly T[],
  key: (item: T) => string | number,
  compare: Comparator<T>,
): DedupeByKeepBestResult<T>
export function dedupeByKeepBest<T>(
  key: (item: T) => string | number,
  compare: Comparator<T>,
): (items: readonly T[]) => DedupeByKeepBestResult<T>
export function dedupeByKeepBest(...args: unknown[]): unknown {
  return R.purry(dedupeByKeepBestImplementation, args)
}

type Entry<T> = { readonly item: T; readonly index: number }

const inInputOrder = <T>(entries: readonly Entry<T>[]): readonly T[] =>
  R.pipe(
    entries,
    R.sort(ascending((entry: Entry<T>) => entry.index)),
    R.map((entry) => entry.item),
  )

const dedupeByKeepBestImplementation = <T>(
  items: readonly T[],
  key: (item: T) => string | number,
  compare: Comparator<T>,
): DedupeByKeepBestResult<T> => {
  // Sorting a group with a stable sort puts the winner first, and the earlier copy on a tie.
  const rankedGroups = R.pipe(
    items,
    R.map((item, index): Entry<T> => ({ item, index })),
    R.groupBy((entry) => key(entry.item)),
    R.values(),
    R.map(R.sort((a, b) => compare(a.item, b.item))),
  )
  return {
    kept: inInputOrder(R.map(rankedGroups, R.first())),
    dropped: inInputOrder(R.flatMap(rankedGroups, R.drop(1))),
  }
}
