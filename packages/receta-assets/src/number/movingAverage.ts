import * as R from 'remeda'
import { windowSliding } from '@ontologyio/receta/collection'
import { sum } from '@ontologyio/receta/number'

/**
 * Smooths a series by averaging each run of `window` consecutive values, such as a 7-day average.
 *
 * Use when: a chart of daily signups, sales or errors is too jumpy to read and a rolling
 * average shows the trend. The result has one value per full window, so it is
 * `window - 1` values shorter than the input and its first value covers the first
 * `window` inputs. A series shorter than the window, or a window under 1, gives `[]`.
 *
 * @example
 * ```ts
 * movingAverage([10, 20, 30, 40, 50], 3)
 * // => [20, 30, 40]
 *
 * R.pipe([4, 8, 6, 2], movingAverage(2))
 * // => [6, 7, 4]
 *
 * movingAverage([1, 2], 7)
 * // => []
 * ```
 *
 * @tags moving average, rolling average, smoothing, trend, time series, chart, sma
 * @see windowSliding - @ontologyio/receta/collection, the runs of consecutive values
 * @see sum - @ontologyio/receta/number, the total of each run
 */
export function movingAverage(values: readonly number[], window: number): readonly number[]
export function movingAverage(window: number): (values: readonly number[]) => readonly number[]
export function movingAverage(...args: unknown[]): unknown {
  return R.purry(movingAverageImplementation, args)
}

const movingAverageImplementation = (values: readonly number[], window: number): readonly number[] =>
  R.pipe(
    windowSliding(values, { size: window }),
    R.map((run) => sum(run) / run.length),
  )
