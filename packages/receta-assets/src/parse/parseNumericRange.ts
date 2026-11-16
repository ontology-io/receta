import * as R from 'remeda'
import { err, flatMap, fromNullable, ok, type Result } from '@ontologyio/receta/result'

export type ParseNumericRangeError = {
  readonly code: 'INVALID_RANGE' | 'REVERSED_RANGE'
  readonly input: string
  readonly message: string
}

export type ParseNumericRangeBounds = {
  /** The low end, included. */
  readonly min: number
  /** The high end, included. */
  readonly max: number
}

const NUMBER = String.raw`(-?\d+(?:\.\d+)?)`
const RANGE = new RegExp(String.raw`^\s*${NUMBER}\s*(?:(?:-|–|\.\.|to)\s*${NUMBER}\s*)?$`, 'i')

/**
 * Parses a range such as `10-50`, `10..50`, `1.5 to 3` or a single `7` into `{ min, max }`.
 *
 * Use when: a filter in a URL, a search box or a spreadsheet cell holds a span, such as a
 * price range `?price=10-50`, an age band or a size range. A single number is a range of one.
 * Negative numbers work, so `-5--1` is -5 to -1. A range whose low end is bigger than its
 * high end is `REVERSED_RANGE` instead of being swapped, since it's usually a typo.
 *
 * @example
 * ```ts
 * parseNumericRange('10-50')
 * // => Ok({ min: 10, max: 50 })
 *
 * parseNumericRange(' -5 .. 2.5 ')
 * // => Ok({ min: -5, max: 2.5 })
 *
 * parseNumericRange('7')
 * // => Ok({ min: 7, max: 7 })
 *
 * parseNumericRange('50-10')
 * // => Err({ code: 'REVERSED_RANGE', input: '50-10', message: 'The range starts at 50, after its end 10' })
 *
 * parseNumericRange('cheap')
 * // => Err({ code: 'INVALID_RANGE', input: 'cheap', message: 'Expected a range such as 10-50, got "cheap"' })
 * ```
 *
 * @tags range, min max, between, filter, price, interval, bounds, span
 * @see parsePageRanges - lists of whole-number ranges such as 1-3, 5
 * @see fromNullable - @ontologyio/receta/result, turns a failed match into an Err
 */
export function parseNumericRange(
  input: string,
): Result<ParseNumericRangeBounds, ParseNumericRangeError> {
  return R.pipe(
    fromNullable(RANGE.exec(input), {
      code: 'INVALID_RANGE',
      input,
      message: `Expected a range such as 10-50, got "${input}"`,
    } satisfies ParseNumericRangeError),
    flatMap(([, low = '0', high]) => {
      const min = Number(low)
      const max = high === undefined ? min : Number(high)
      return min > max
        ? err<ParseNumericRangeError>({
            code: 'REVERSED_RANGE',
            input,
            message: `The range starts at ${min}, after its end ${max}`,
          })
        : ok({ min, max })
    }),
  )
}
