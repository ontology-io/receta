import * as R from 'remeda'
import { sum } from '@ontologyio/receta/number'
import { filter, map, some, type Option } from '@ontologyio/receta/option'
import { neq } from '@ontologyio/receta/predicate'

/**
 * Averages a number from each item, letting each item count as much as its weight.
 *
 * Use when: a grade point average weighted by credits, an average price weighted by
 * quantity, or a rating combined from sources of different sizes. Returns `None` when the
 * weights add up to zero, which includes an empty list, so the result is never `NaN` or
 * `Infinity`.
 *
 * @example
 * ```ts
 * const courses = [
 *   { grade: 90, credits: 3 },
 *   { grade: 70, credits: 1 },
 * ]
 *
 * weightedAverage(courses, (course) => course.grade, (course) => course.credits)
 * // => Some(85)
 *
 * R.pipe(courses, weightedAverage((course) => course.grade, R.constant(1)))
 * // => Some(80)
 *
 * weightedAverage(courses, (course) => course.grade, R.constant(0))
 * // => None
 * ```
 *
 * @tags weighted average, mean, gpa, weights, credits, quantity, statistics, aggregate
 * @see sum - @ontologyio/receta/number, the weighted total and the total weight
 * @see averageBy - every item counts the same
 */
export function weightedAverage<T>(
  items: readonly T[],
  value: (item: T) => number,
  weight: (item: T) => number,
): Option<number>
export function weightedAverage<T>(
  value: (item: T) => number,
  weight: (item: T) => number,
): (items: readonly T[]) => Option<number>
export function weightedAverage(...args: unknown[]): unknown {
  return R.purry(weightedAverageImplementation, args)
}

const weightedAverageImplementation = <T>(
  items: readonly T[],
  value: (item: T) => number,
  weight: (item: T) => number,
): Option<number> => {
  const weightedTotal = sum(R.map(items, (item) => value(item) * weight(item)))
  return R.pipe(
    some(sum(R.map(items, weight))),
    filter(neq(0)),
    map((totalWeight) => weightedTotal / totalWeight),
  )
}
