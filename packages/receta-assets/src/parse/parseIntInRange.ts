import * as R from 'remeda'
import { isInteger } from '@ontologyio/receta/number'
import { between, matches } from '@ontologyio/receta/predicate'
import { err, flatMap, mapErr, ok, parseNumber, type Result } from '@ontologyio/receta/result'

const isIntegerText = matches(/^-?\d+$/)

export type ParseIntInRangeBounds = {
  /** The smallest value allowed, included. */
  readonly min: number
  /** The largest value allowed, included. */
  readonly max: number
}

export type ParseIntInRangeError = {
  readonly code: 'NOT_AN_INTEGER' | 'OUT_OF_RANGE'
  readonly input: string
  readonly message: string
}

/**
 * Parses a whole number from text and checks it lies between a minimum and a maximum, both included.
 *
 * Use when: a count, limit, age, retry total or page size comes in as text and a value
 * outside its range must be refused with a reason, not clamped. Only digits with an optional
 * minus sign count: decimals, blanks, `1e3`, `0x10` and trailing junk such as `12abc` are
 * `NOT_AN_INTEGER`.
 *
 * @example
 * ```ts
 * parseIntInRange('25', { min: 1, max: 100 })
 * // => Ok(25)
 *
 * parseIntInRange('2.5', { min: 1, max: 100 })
 * // => Err({ code: 'NOT_AN_INTEGER', input: '2.5', message: 'Expected a whole number, got "2.5"' })
 *
 * parseIntInRange('12abc', { min: 1, max: 100 })
 * // => Err({ code: 'NOT_AN_INTEGER', input: '12abc', message: 'Expected a whole number, got "12abc"' })
 *
 * R.pipe('500', parseIntInRange({ min: 1, max: 100 }))
 * // => Err({ code: 'OUT_OF_RANGE', input: '500', message: 'Expected a number from 1 to 100, got 500' })
 * ```
 *
 * @tags integer, range, limit, bounds, min, max, query, env, int
 * @see parseNumber - @ontologyio/receta/result, the number parse underneath
 * @see parseOptionalInt - blank input is allowed and comes back as None
 */
export function parseIntInRange(
  input: string,
  bounds: ParseIntInRangeBounds,
): Result<number, ParseIntInRangeError>
export function parseIntInRange(
  bounds: ParseIntInRangeBounds,
): (input: string) => Result<number, ParseIntInRangeError>
export function parseIntInRange(...args: unknown[]): unknown {
  return R.purry(parseIntInRangeImplementation, args)
}

const parseIntInRangeImplementation = (
  input: string,
  { min, max }: ParseIntInRangeBounds,
): Result<number, ParseIntInRangeError> => {
  const text = input.trim()
  return R.pipe(
    // Digits only: parseNumber alone takes '1e3' and '0x10', and Receta's parseInt reads '12abc' as 12.
    isIntegerText(text) ? parseNumber(text) : err(undefined),
    // isInteger also refuses numbers too large to be exact, past 2^53.
    flatMap((value) => (isInteger(value) ? ok(value) : err(undefined))),
    mapErr((): ParseIntInRangeError => ({
      code: 'NOT_AN_INTEGER',
      input,
      message: `Expected a whole number, got "${input}"`,
    })),
    flatMap((value) =>
      between(min, max)(value)
        ? ok(value)
        : err<ParseIntInRangeError>({
            code: 'OUT_OF_RANGE',
            input,
            message: `Expected a number from ${min} to ${max}, got ${value}`,
          }),
    ),
  )
}
