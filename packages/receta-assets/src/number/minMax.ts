import * as R from 'remeda'
import { fromNullable, map, type Option } from '@ontologyio/receta/option'
import { isFiniteNumber } from '@ontologyio/receta/predicate'

export type MinMaxRange = { readonly min: number; readonly max: number }

/**
 * Finds the smallest and the largest number of a list in one pass.
 *
 * Use when: setting a chart's axis, a price filter's slider bounds or a color scale from
 * data. `NaN` and infinite values are skipped, so one bad reading can't break the range.
 * Returns `None` when no finite number is left, where `Math.min()` would give `Infinity`.
 * Works on lists of any length, unlike `Math.min(...values)`.
 *
 * @example
 * ```ts
 * minMax([12, 3, 45, 7])
 * // => Some({ min: 3, max: 45 })
 *
 * minMax([5, Number.NaN, -2])
 * // => Some({ min: -2, max: 5 })
 *
 * minMax([])
 * // => None
 * ```
 *
 * @tags min, max, range, bounds, extent, axis, slider, statistics
 * @see fromNullable - @ontologyio/receta/option, None for an empty list
 * @see normalizeScores - rescales values into this range
 */
export function minMax(values: readonly number[]): Option<MinMaxRange> {
  const finite = R.filter(values, isFiniteNumber)
  return R.pipe(
    fromNullable(R.first(finite)),
    map((first) =>
      R.reduce(
        finite,
        (range: MinMaxRange, value) => ({ min: Math.min(range.min, value), max: Math.max(range.max, value) }),
        { min: first, max: first },
      ),
    ),
  )
}
