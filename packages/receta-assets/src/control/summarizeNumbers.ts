import * as R from 'remeda'
import { converge } from '@ontologyio/receta/function'
import { sum } from '@ontologyio/receta/number'
import { none, some, type Option } from '@ontologyio/receta/option'
import { isFiniteNumber } from '@ontologyio/receta/predicate'

export type SummarizeNumbersSummary = {
  readonly count: number
  readonly sum: number
  readonly min: number
  readonly max: number
  readonly mean: number
}

const lowest = (values: readonly number[]): number => R.reduce(values, (low, n) => Math.min(low, n), Infinity)
const highest = (values: readonly number[]): number => R.reduce(values, (high, n) => Math.max(high, n), -Infinity)

const summary = (count: number, total: number, min: number, max: number): SummarizeNumbersSummary => ({
  count,
  sum: total,
  min,
  max,
  mean: total / count,
})

/**
 * Computes count, sum, min, max and mean of a list of numbers in one call, skipping values that aren't finite.
 *
 * Use when: a dashboard tile, a report footer or a log line needs the usual figures for a
 * column, such as response times, order totals or scores. `NaN`, `Infinity` and `-Infinity`
 * are left out, so one bad reading doesn't poison every figure, and `count` says how many were
 * used. `None` when no finite number is left, rather than a mean of `NaN`. Safe for long lists,
 * unlike `Math.min(...values)`.
 *
 * @example
 * ```ts
 * summarizeNumbers([120, 80, 340, 60])
 * // => Some({ count: 4, sum: 600, min: 60, max: 340, mean: 150 })
 *
 * summarizeNumbers([3, NaN, 5])
 * // => Some({ count: 2, sum: 8, min: 3, max: 5, mean: 4 })
 *
 * summarizeNumbers([])
 * // => None
 * ```
 *
 * @tags statistics, summary, min, max, mean, average, sum, aggregate, report, dashboard
 * @see converge - @ontologyio/receta/function, computes every figure from the one list
 * @see sum - @ontologyio/receta/number, the total
 */
export function summarizeNumbers(values: readonly number[]): Option<SummarizeNumbersSummary> {
  const finite = R.filter(values, isFiniteNumber)
  return R.isEmpty(finite) ? none() : some(converge(summary, [R.length, sum, lowest, highest], finite))
}
