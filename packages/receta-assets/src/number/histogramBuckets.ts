import * as R from 'remeda'
import { isFiniteNumber } from '@ontologyio/receta/predicate'

export type HistogramBucketsEntry = {
  /** Where the bucket starts, included. */
  readonly from: number
  /** Where the bucket ends, left out; it is the next bucket's `from`. */
  readonly to: number
  readonly count: number
}

/**
 * Counts numbers into equal-width buckets for a histogram, including the empty buckets between.
 *
 * Use when: drawing a distribution of order values, response times, ages or scores. Each
 * bucket covers `from` up to but not including `to`. Buckets start at a multiple of
 * `size`, so edges are round numbers, and empty buckets in the middle are kept so the
 * chart's bars line up with its axis. `NaN` and infinite values are skipped. No values,
 * or a size of zero or less, give `[]`. Whole-number sizes keep the edges exact.
 *
 * ```text
 *  STEP                         DATA AFTER IT
 *  ───────────────────────────  ───────────────────────────────────────────
 *  values, size 10              [3, 12, 17, 41]
 *  start: lowest, rounded down  0
 *  to a multiple of size
 *  bucket index of each value   [0, 1, 1, 4]
 *  count per index              { 0: 1, 1: 2, 4: 1 }
 *  every index 0 … 4            [0–10: 1, 10–20: 2, 20–30: 0, 30–40: 0, 40–50: 1]
 * ```
 *
 * @example
 * ```ts
 * histogramBuckets([3, 12, 17, 41], 10)
 * // => [
 * //   { from: 0, to: 10, count: 1 },
 * //   { from: 10, to: 20, count: 2 },
 * //   { from: 20, to: 30, count: 0 },
 * //   { from: 30, to: 40, count: 0 },
 * //   { from: 40, to: 50, count: 1 },
 * // ]
 *
 * R.pipe([250, 260, 199], histogramBuckets(100))
 * // => [{ from: 100, to: 200, count: 1 }, { from: 200, to: 300, count: 2 }]
 *
 * histogramBuckets([], 10)
 * // => []
 * ```
 *
 * @tags histogram, buckets, bins, distribution, frequency, chart, group, range
 * @see isFiniteNumber - @ontologyio/receta/predicate, skips values that can't be placed
 */
export function histogramBuckets(values: readonly number[], size: number): readonly HistogramBucketsEntry[]
export function histogramBuckets(size: number): (values: readonly number[]) => readonly HistogramBucketsEntry[]
export function histogramBuckets(...args: unknown[]): unknown {
  return R.purry(histogramBucketsImplementation, args)
}

const histogramBucketsImplementation = (values: readonly number[], size: number): readonly HistogramBucketsEntry[] => {
  const finite = R.filter(values, isFiniteNumber)
  const lowest = R.firstBy(finite, R.identity())
  const highest = R.firstBy(finite, [R.identity(), 'desc'])
  if (lowest === undefined || highest === undefined || size <= 0) return []
  const start = Math.floor(lowest / size) * size
  const indexOf = (value: number): number => Math.floor((value - start) / size)
  const counts = R.countBy(finite, (value) => String(indexOf(value)))
  const buckets = indexOf(highest) + 1
  return R.times(buckets, (index) => ({
    from: start + index * size,
    to: start + (index + 1) * size,
    count: counts[String(index)] ?? 0,
  }))
}
