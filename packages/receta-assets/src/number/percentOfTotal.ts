import * as R from 'remeda'
import { sum } from '@ontologyio/receta/number'
import { oneOf } from '@ontologyio/receta/predicate'

/**
 * Turns values into whole percents of their total that always add up to exactly 100.
 *
 * Use when: labelling a pie chart, a stacked bar or a survey result, where rounding each
 * share on its own can show 99% or 101% in total. Each share is rounded down, then the
 * points still missing go to the shares that lost the most in rounding (the largest
 * remainder method); ties go to the earlier value. The result is in the same order as the
 * input. Values should not be negative. A total of zero gives zeros.
 *
 * ```text
 *  STEP                          DATA AFTER IT
 *  ────────────────────────────  ──────────────────────────────────────
 *  values                        [120, 45, 35]          total 200
 *  value × 100 ÷ total           [60, 22.5, 17.5]       sum 100
 *  round each down               [60, 22, 17]           sum 99, 1 short
 *  +1 to the largest remainders  [60, 23, 17]           sum 100
 *  (0.5 and 0.5 tie: first wins)
 * ```
 *
 * @example
 * ```ts
 * percentOfTotal([120, 45, 35])
 * // => [60, 23, 17]
 *
 * percentOfTotal([1, 1, 1])
 * // => [34, 33, 33]
 *
 * percentOfTotal([0, 0])
 * // => [0, 0]
 * ```
 *
 * @tags percent, share, total, pie chart, rounding, largest remainder, survey, distribution
 * @see sum - @ontologyio/receta/number, the total and the points still missing
 * @see splitByWeights - the same method for splitting an amount of money
 * @see formatShare - one share as text, never a misleading 0% or 100%
 */
export function percentOfTotal(values: readonly number[]): readonly number[] {
  const total = sum(values)
  if (total <= 0) return R.map(values, R.constant(0))
  const exact = R.map(values, (value) => (value * 100) / total)
  const floors = R.map(exact, (share) => Math.floor(share))
  const bumped = R.pipe(
    exact,
    R.map((share, index) => ({ index, remainder: share - Math.floor(share) })),
    R.sortBy([R.prop('remainder'), 'desc']),
    R.take(100 - sum(floors)),
    R.map(R.prop('index')),
  )
  return R.map(floors, (floor, index) => (oneOf(bumped)(index) ? floor + 1 : floor))
}
