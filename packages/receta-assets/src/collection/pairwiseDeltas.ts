import * as R from 'remeda'
import { none, some, type Option } from '@ontologyio/receta/option'

export type PairwiseDeltasEntry<T> = {
  readonly from: T
  readonly to: T
  /** `value(to) - value(from)`. */
  readonly delta: number
  /** The delta as a fraction of `value(from)`, so 0.25 is +25%. `None` when `value(from)` is 0. */
  readonly change: Option<number>
}

/**
 * Pairs each item with the next one and gives the difference between them, absolute and relative.
 *
 * Use when: showing month-over-month revenue, the growth between releases, or how much a price
 * moved since the last reading. A list of n items gives n - 1 pairs. The relative change is
 * measured against the size of the starting value, so a move from -10 to -5 is +50%. It is
 * `None` when the starting value is 0, where a percentage has no meaning.
 *
 * @example
 * ```ts
 * const revenue = [
 *   { month: 'Jan', total: 100 },
 *   { month: 'Feb', total: 125 },
 *   { month: 'Mar', total: 0 },
 *   { month: 'Apr', total: 50 },
 * ]
 *
 * R.pipe(
 *   pairwiseDeltas(revenue, (row) => row.total),
 *   R.map(({ to, delta, change }) => ({ month: to.month, delta, change })),
 * )
 * // => [
 * //   { month: 'Feb', delta: 25, change: Some(0.25) },
 * //   { month: 'Mar', delta: -125, change: Some(-1) },
 * //   { month: 'Apr', delta: 50, change: None },
 * // ]
 *
 * R.pipe([{ total: 5 }], pairwiseDeltas((row) => row.total))
 * // => []
 * ```
 *
 * @tags delta, difference, change, growth, month over month, period over period, trend, percent change
 * @see movingAverage - smooths a series before comparing
 */
export function pairwiseDeltas<T>(
  items: readonly T[],
  value: (item: T) => number,
): readonly PairwiseDeltasEntry<T>[]
export function pairwiseDeltas<T>(value: (item: T) => number): (items: readonly T[]) => readonly PairwiseDeltasEntry<T>[]
export function pairwiseDeltas(...args: unknown[]): unknown {
  return R.purry(pairwiseDeltasImplementation, args)
}

const relativeChange = (start: number, delta: number): Option<number> =>
  start === 0 ? none() : some(delta / Math.abs(start))

const pairwiseDeltasImplementation = <T>(
  items: readonly T[],
  value: (item: T) => number,
): readonly PairwiseDeltasEntry<T>[] =>
  // Zipping the list with itself shifted by one pairs every item with the next.
  R.zipWith(items, R.drop(items, 1), (from, to) => {
    const delta = value(to) - value(from)
    return { from, to, delta, change: relativeChange(value(from), delta) }
  })
