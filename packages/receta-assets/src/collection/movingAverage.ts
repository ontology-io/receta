import * as R from 'remeda'
import { windowSliding } from '@ontologyio/receta/collection'
import { sum } from '@ontologyio/receta/number'

/**
 * Smooths a series with a trailing moving average: each output is the mean of `size` values in a row.
 *
 * Use when: drawing a 7-day average over daily sign-ups, smoothing latency samples, or damping
 * noise before spotting a trend. The result is `size - 1` values shorter than the input, and
 * its first value averages the first `size` inputs. A series shorter than `size`, or a `size`
 * below 1, gives `[]`. A fractional `size` is rounded down.
 *
 * @example
 * ```ts
 * movingAverage([1, 2, 3, 4, 5], 3)
 * // => [2, 3, 4]
 *
 * const daily = [{ signups: 10 }, { signups: 30 }, { signups: 20 }, { signups: 40 }]
 * R.pipe(daily, R.map(R.prop('signups')), movingAverage(2))
 * // => [20, 25, 30]
 *
 * movingAverage([10, 20], 3)
 * // => []
 * ```
 *
 * @tags moving average, rolling average, smoothing, trend, series, chart, mean, window, sma
 * @see windowSliding - @ontologyio/receta/collection, the windows being averaged
 * @see sum - @ontologyio/receta/number, the total of each window
 */
export function movingAverage(values: readonly number[], size: number): readonly number[]
export function movingAverage(size: number): (values: readonly number[]) => readonly number[]
export function movingAverage(...args: unknown[]): unknown {
  return R.purry(movingAverageImplementation, args)
}

const movingAverageImplementation = (values: readonly number[], size: number): readonly number[] => {
  const width = Math.floor(size)
  return R.map(windowSliding(values, { size: width }), (window) => sum(window) / width)
}
