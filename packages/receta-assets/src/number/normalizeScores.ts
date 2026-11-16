import * as R from 'remeda'
import { normalize } from '@ontologyio/receta/number'

/**
 * Rescales numbers so the smallest becomes 0 and the largest 1, keeping their order and spacing.
 *
 * Use when: combining scores on different scales, such as relevance and recency in a
 * search ranking, drawing bars relative to the largest value, or feeding features to a
 * model. When every value is the same, they all become 1, since they all tie for the top.
 * An empty list gives `[]`. Pass finite numbers; a `NaN` makes every result `NaN`.
 *
 * @example
 * ```ts
 * normalizeScores([2, 4, 10])
 * // => [0, 0.25, 1]
 *
 * normalizeScores([7, 7])
 * // => [1, 1]
 *
 * normalizeScores([])
 * // => []
 * ```
 *
 * @tags normalize, scale, min max, rescale, 0 to 1, scores, ranking, feature scaling
 * @see normalize - @ontologyio/receta/number, rescales one value into a range
 * @see minMax - the range itself
 */
export function normalizeScores(values: readonly number[]): readonly number[] {
  const low = R.firstBy(values, R.identity())
  const high = R.firstBy(values, [R.identity(), 'desc'])
  if (low === undefined || high === undefined) return []
  if (low === high) return R.map(values, R.constant(1))
  return R.map(values, (value) => normalize(value, low, high))
}
