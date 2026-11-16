import * as R from 'remeda'
import { average, sum } from '@ontologyio/receta/number'
import { filter, flatMap, map, some, type Option } from '@ontologyio/receta/option'
import { gt, isFiniteNumber } from '@ontologyio/receta/predicate'

/** `sample` divides by n − 1 for data drawn from a larger group; `population` divides by n. */
export type StandardDeviationKind = 'sample' | 'population'

/**
 * Measures how spread out numbers are around their mean, for a sample or a whole population.
 *
 * Use when: flagging unusual values, showing error bars, or checking how steady a metric
 * is, such as response times or daily sales. Pick `sample` when the numbers are a subset,
 * as Excel's `STDEV.S` does, and `population` when they are every value there is, as
 * `STDEV.P` does. `NaN` and infinite values are skipped. Returns `None` for an empty list,
 * and for a sample of fewer than two values, where the spread isn't defined.
 *
 * @example
 * ```ts
 * standardDeviation([2, 4, 4, 4, 5, 5, 7, 9], 'population')
 * // => Some(2)
 *
 * standardDeviation([1, 3], 'sample')
 * // => Some(1.4142135623730951)
 *
 * R.pipe([42], standardDeviation('sample'))
 * // => None
 * ```
 *
 * @tags standard deviation, stdev, variance, spread, statistics, volatility, error bars
 * @see average - @ontologyio/receta/number, the mean the spread is measured from
 * @see sum - @ontologyio/receta/number, adds up the squared distances
 */
export function standardDeviation(values: readonly number[], kind: StandardDeviationKind): Option<number>
export function standardDeviation(kind: StandardDeviationKind): (values: readonly number[]) => Option<number>
export function standardDeviation(...args: unknown[]): unknown {
  return R.purry(standardDeviationImplementation, args)
}

const standardDeviationImplementation = (
  values: readonly number[],
  kind: StandardDeviationKind,
): Option<number> => {
  const numbers = R.filter(values, isFiniteNumber)
  const divisor = kind === 'sample' ? numbers.length - 1 : numbers.length
  return R.pipe(
    some(divisor),
    filter(gt(0)),
    flatMap(() => average(numbers)),
    map((mean) => Math.sqrt(sum(R.map(numbers, (value) => (value - mean) ** 2)) / divisor)),
  )
}
