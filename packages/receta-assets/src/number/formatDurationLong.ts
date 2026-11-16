import * as R from 'remeda'
import { clamp } from '@ontologyio/receta/number'
import { gt, where } from '@ontologyio/receta/predicate'
import { pluralize } from '@ontologyio/receta/string'

type FormatDurationLongPart = { readonly count: number; readonly unit: string }

const UNITS = [
  [86_400_000, 'day'],
  [3_600_000, 'hour'],
  [60_000, 'minute'],
  [1000, 'second'],
] as const

const breakDown = (ms: number): readonly FormatDurationLongPart[] =>
  R.reduce(
    UNITS,
    ({ rest, parts }, [size, unit]) => ({
      rest: rest % size,
      parts: [...parts, { count: Math.floor(rest / size), unit }],
    }),
    { rest: ms, parts: [] as readonly FormatDurationLongPart[] },
  ).parts

/**
 * Formats milliseconds as words with its two largest units: `1 hour 5 minutes`, `45 seconds`.
 *
 * Use when: a sentence or a screen reader says how long something took or will take, such
 * as "Estimated time: 2 hours 10 minutes" or an accessible label for a timer. Units that
 * are zero are skipped, and smaller ones are cut off, not rounded. Anything under a second,
 * including negative values from clock skew, reads `less than a second`. English only.
 *
 * @example
 * ```ts
 * formatDurationLong(3_900_000)
 * // => '1 hour 5 minutes'
 *
 * formatDurationLong(172_801_000)
 * // => '2 days 1 second'
 *
 * formatDurationLong(400)
 * // => 'less than a second'
 * ```
 *
 * @tags duration, elapsed, time, words, accessible, aria label, estimate, hours, minutes
 * @see pluralize - @ontologyio/receta/string, `1 hour` or `2 hours`
 * @see clamp - @ontologyio/receta/number, treats negative durations as zero
 * @see formatDuration - the short form: `1h 5m`
 */
export function formatDurationLong(ms: number): string {
  const total = clamp(ms, 0, Number.MAX_SAFE_INTEGER)
  if (total < 1000) return 'less than a second'
  return R.pipe(
    breakDown(total),
    R.filter(where({ count: gt(0) })),
    R.take(2),
    R.map(({ count, unit }) => pluralize(unit, count)),
    R.join(' '),
  )
}
