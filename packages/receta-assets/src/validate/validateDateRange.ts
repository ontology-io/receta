import * as R from 'remeda'
import { always, gte } from '@ontologyio/receta/predicate'
import { finite, flatMap, fromPredicate, schema, type FieldError, type Validation } from '@ontologyio/receta/validation'

export type ValidateDateRangeInput = {
  /** Start, in milliseconds since the epoch, as `Date.getTime()` and `Date.parse` return. */
  readonly start: number
  /** End, in milliseconds since the epoch. */
  readonly end: number
}

/** A broken start has its own message, so the end isn't compared with it. */
const notBefore = (start: number): ((end: number) => boolean) =>
  Number.isFinite(start) ? gte(start) : always<number>()

/**
 * Checks a start and end timestamp pair: both are real dates and the end is not before the start.
 *
 * Use when: a report filter, booking or export form takes "from" and "to" dates and the
 * server must refuse a range that runs backwards. Timestamps are milliseconds, so a date
 * that failed to parse arrives as `NaN` and is reported as missing. An equal start and end is
 * a valid zero-length range. The end is only compared once both dates are valid.
 *
 * @example
 * ```ts
 * validateDateRange({ start: Date.UTC(2026, 0, 1), end: Date.UTC(2026, 0, 31) })
 * // => Valid({ start: 1767225600000, end: 1769817600000 })
 *
 * validateDateRange({ start: Date.UTC(2026, 1, 1), end: Date.UTC(2026, 0, 1) })
 * // => Invalid([{ field: 'end', errors: ['End date must be on or after the start date'] }])
 *
 * validateDateRange({ start: Date.parse('not a date'), end: Number.NaN })
 * // => Invalid([
 * //   { field: 'start', errors: ['Enter a valid start date'] },
 * //   { field: 'end', errors: ['Enter a valid end date'] },
 * // ])
 * ```
 *
 * @tags date, range, period, from, to, start, end, timestamp, filter, report
 * @see validateBookingRange - a stay with nights counted and a date that can't be in the past
 */
export function validateDateRange(range: ValidateDateRangeInput): Validation<ValidateDateRangeInput, FieldError<string>> {
  return schema<ValidateDateRangeInput, string>(
    {
      start: finite('Enter a valid start date'),
      end: (end) =>
        R.pipe(
          end,
          finite('Enter a valid end date'),
          flatMap(fromPredicate(notBefore(range.start), 'End date must be on or after the start date')),
        ),
    },
    range,
  )
}
