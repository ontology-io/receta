import * as R from 'remeda'
import { clamp } from '@ontologyio/receta/number'
import { gt, where } from '@ontologyio/receta/predicate'

type FormatDurationPart = { readonly count: number; readonly unit: string }

const UNITS = [
  [86_400_000, 'd'],
  [3_600_000, 'h'],
  [60_000, 'm'],
  [1000, 's'],
] as const

const breakDown = (ms: number): readonly FormatDurationPart[] =>
  R.reduce(
    UNITS,
    ({ rest, parts }, [size, unit]) => ({
      rest: rest % size,
      parts: [...parts, { count: Math.floor(rest / size), unit }],
    }),
    { rest: ms, parts: [] as readonly FormatDurationPart[] },
  ).parts

/**
 * Formats milliseconds as a short duration with its two largest units: `1h 5m`, `45s`, `850ms`.
 *
 * Use when: showing how long a job, a request, a call or a video took, in a table cell or
 * a log line. Units are days, hours, minutes and seconds; units that are zero are skipped,
 * and smaller ones are cut off, not rounded, so `1h 59m 59s` reads `1h 59m`. Under a
 * second it shows whole milliseconds. A negative duration, from clock skew, reads `0ms`.
 *
 * @example
 * ```ts
 * formatDuration(3_900_000)
 * // => '1h 5m'
 *
 * formatDuration(90_061_000)
 * // => '1d 1h'
 *
 * formatDuration(45_300)
 * // => '45s'
 *
 * formatDuration(850.7)
 * // => '850ms'
 *
 * formatDuration(-20)
 * // => '0ms'
 * ```
 *
 * @tags duration, elapsed, time, milliseconds, hours, minutes, timer, latency, human readable
 * @see clamp - @ontologyio/receta/number, treats negative durations as zero
 * @see formatDurationLong - the same with words: `1 hour 5 minutes`
 */
export function formatDuration(ms: number): string {
  const total = clamp(ms, 0, Number.MAX_SAFE_INTEGER)
  if (total < 1000) return `${Math.floor(total)}ms`
  return R.pipe(
    breakDown(total),
    R.filter(where({ count: gt(0) })),
    R.take(2),
    R.map(({ count, unit }) => `${count}${unit}`),
    R.join(' '),
  )
}
