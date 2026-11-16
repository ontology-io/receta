import * as R from 'remeda'
import { isInteger } from '@ontologyio/receta/number'
import { none, some, type Option } from '@ontologyio/receta/option'
import { matches } from '@ontologyio/receta/predicate'
import { err, flatMap, mapErr, ok, parseNumber, type Result } from '@ontologyio/receta/result'
import { isEmpty } from '@ontologyio/receta/string'

const isIntegerText = matches(/^-?\d+$/)

export type ParseOptionalIntError = {
  readonly code: 'NOT_AN_INTEGER'
  readonly input: string
  readonly message: string
}

/**
 * Parses a whole number that may be left blank: blank is Ok(None), a number is Ok(Some(n)), anything else is Err.
 *
 * Use when: an optional numeric field, such as a form input, a CSV cell or a query
 * parameter, may be empty, but a value that is present must be a whole number. Blank and
 * missing mean "not given"; they are never read as 0. Only digits with an optional minus sign
 * count, so `1e3` and `12abc` are an `Err`.
 *
 * @example
 * ```ts
 * parseOptionalInt('42')
 * // => Ok(Some(42))
 *
 * parseOptionalInt('   ')
 * // => Ok(None)
 *
 * parseOptionalInt(undefined)
 * // => Ok(None)
 *
 * parseOptionalInt('4.2')
 * // => Err({ code: 'NOT_AN_INTEGER', input: '4.2', message: 'Expected a whole number or nothing, got "4.2"' })
 *
 * parseOptionalInt('12abc')
 * // => Err({ code: 'NOT_AN_INTEGER', input: '12abc', message: 'Expected a whole number or nothing, got "12abc"' })
 * ```
 *
 * @tags integer, optional, blank, empty, form, nullable, csv, query
 * @see parseIntInRange - the value is required and must lie in a range
 * @see isEmpty - @ontologyio/receta/string, what counts as blank
 */
export function parseOptionalInt(
  input: string | undefined,
): Result<Option<number>, ParseOptionalIntError> {
  if (input === undefined || isEmpty(input)) return ok(none())
  const text = input.trim()
  return R.pipe(
    // Digits only: parseNumber alone takes '1e3' and '0x10', and Receta's parseInt reads '12abc' as 12.
    isIntegerText(text) ? parseNumber(text) : err(undefined),
    flatMap((value) => (isInteger(value) ? ok(some(value)) : err(undefined))),
    mapErr((): ParseOptionalIntError => ({
      code: 'NOT_AN_INTEGER',
      input,
      message: `Expected a whole number or nothing, got "${input}"`,
    })),
  )
}
