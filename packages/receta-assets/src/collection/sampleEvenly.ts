import * as R from 'remeda'
import { round } from '@ontologyio/receta/number'

/**
 * Picks `count` items spread evenly across a list, always keeping the first and the last.
 *
 * Use when: thinning 1,000 points to 50 for a sparkline, choosing which dates to label on a
 * chart axis, or taking preview frames from a long recording. Picks keep their input order.
 * Asking for as many items as the list has, or more, returns the whole list, and a `count` of
 * 1 returns the first item. It doesn't look at values, so a short spike between picks can be
 * lost; use a peak-preserving method when that matters.
 *
 * @example
 * ```ts
 * sampleEvenly(R.range(0, 101), 5)
 * // => [0, 25, 50, 75, 100]
 *
 * R.pipe(['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul'], sampleEvenly(3))
 * // => ['jan', 'apr', 'jul']
 *
 * sampleEvenly(['a', 'b'], 10)
 * // => ['a', 'b']
 * ```
 *
 * @tags sample, downsample, thin, decimate, spread, chart, sparkline, axis labels, evenly spaced
 * @see splitEvenly - every item, divided into even parts
 * @see round - @ontologyio/receta/number, snaps each pick to the nearest position
 */
export function sampleEvenly<T>(items: readonly T[], count: number): readonly T[]
export function sampleEvenly(count: number): <T>(items: readonly T[]) => readonly T[]
export function sampleEvenly(...args: unknown[]): unknown {
  return R.purry(sampleEvenlyImplementation, args)
}

const sampleEvenlyImplementation = <T>(items: readonly T[], count: number): readonly T[] => {
  const picks = Math.floor(count)
  if (picks >= items.length) return items
  if (picks < 1) return []
  // With one pick there is no gap to divide, so the step is 0 and the first item is the pick.
  const step = picks === 1 ? 0 : (items.length - 1) / (picks - 1)
  const picked = new Set(R.map(R.range(0, picks), (pick) => round(pick * step, 0)))
  return R.filter(items, (_, index) => picked.has(index))
}
