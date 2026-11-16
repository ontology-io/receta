import * as R from 'remeda'
import { clamp, interpolate } from '@ontologyio/receta/number'
import { none, some, type Option } from '@ontologyio/receta/option'
import { isFiniteNumber } from '@ontologyio/receta/predicate'

/**
 * Finds the value below which a given percent of the numbers fall, such as p95 latency.
 *
 * Use when: reporting response-time percentiles, setting a threshold from a distribution,
 * or cutting off outliers. Between two values it interpolates linearly, the way Excel's
 * `PERCENTILE.INC` and NumPy's default do. `p` is from 0 to 100 and is clamped to that
 * range. `NaN` and infinite values are skipped. Returns `None` for an empty list.
 *
 * @example
 * ```ts
 * const latenciesMs = [120, 85, 300, 95, 110]
 *
 * percentile(latenciesMs, 75)
 * // => Some(120)
 *
 * percentile([10, 20, 30, 40], 50)
 * // => Some(25)
 *
 * R.pipe(latenciesMs, percentile(100))
 * // => Some(300)
 *
 * percentile([], 95)
 * // => None
 * ```
 *
 * @tags percentile, p95, p99, quantile, latency, statistics, distribution, threshold
 * @see interpolate - @ontologyio/receta/number, the value between two ranks
 * @see clamp - @ontologyio/receta/number, keeps `p` between 0 and 100
 * @see median - the 50th percentile
 */
export function percentile(values: readonly number[], p: number): Option<number>
export function percentile(p: number): (values: readonly number[]) => Option<number>
export function percentile(...args: unknown[]): unknown {
  return R.purry(percentileImplementation, args)
}

const percentileImplementation = (values: readonly number[], p: number): Option<number> => {
  const sorted = R.pipe(values, R.filter(isFiniteNumber), R.sortBy(R.identity()))
  const rank = (clamp(p, 0, 100) / 100) * (sorted.length - 1)
  const below = sorted[Math.floor(rank)]
  const above = sorted[Math.ceil(rank)]
  if (below === undefined || above === undefined) return none()
  return some(interpolate(below, above, rank - Math.floor(rank)))
}
