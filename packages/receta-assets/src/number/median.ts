import * as R from 'remeda'
import { average } from '@ontologyio/receta/number'
import { fromNullable, type Option } from '@ontologyio/receta/option'
import { isFiniteNumber } from '@ontologyio/receta/predicate'

/**
 * Finds the middle value of a list of numbers, or the mean of the two middle ones.
 *
 * Use when: a typical value matters more than the mean because a few outliers would
 * skew it, such as house prices, response times or salaries. `NaN` and infinite values
 * are skipped. Returns `None` for an empty list. The input isn't changed.
 *
 * @example
 * ```ts
 * median([120, 85, 3000, 95, 110])
 * // => Some(110)
 *
 * median([4, 1, 3, 2])
 * // => Some(2.5)
 *
 * median([Number.NaN])
 * // => None
 * ```
 *
 * @tags median, middle, statistics, outliers, typical, p50, average
 * @see average - @ontologyio/receta/number, the mean of the two middle values
 * @see percentile - any percentile, not only the 50th
 */
export function median(values: readonly number[]): Option<number> {
  const sorted = R.pipe(values, R.filter(isFiniteNumber), R.sortBy(R.identity()))
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 1
    ? fromNullable(sorted[middle])
    : average(R.filter([sorted[middle - 1], sorted[middle]], R.isDefined))
}
