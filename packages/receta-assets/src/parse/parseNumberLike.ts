import * as R from 'remeda'
import { isFiniteNumber, isString } from '@ontologyio/receta/predicate'
import { err, mapErr, ok, parseNumber, type Result } from '@ontologyio/receta/result'

export type ParseNumberLikeError = {
  readonly code: 'NOT_A_NUMBER'
  /** The value as it came in, whatever its type. */
  readonly input: unknown
  readonly message: string
}

const describe = (value: unknown): string =>
  isString(value) ? `"${value}"` : value === null ? 'null' : R.isArray(value) ? 'an array' : typeof value

/**
 * Accepts a finite number or numeric text such as `' 12.5 '` from an unknown value, and refuses everything else.
 *
 * Use when: a number arrives from JSON, a spreadsheet, a form library or a third-party API
 * that sometimes sends `12` and sometimes `"12"`, and the code needs a plain `number`.
 * Numbers must be finite; text is trimmed and must be a whole numeric string (`12px` and
 * `''` are refused). `NaN`, `Infinity`, booleans, `null`, arrays and objects are an `Err`,
 * never quietly turned into 0 or 1 the way `Number()` would.
 *
 * @example
 * ```ts
 * parseNumberLike(42)
 * // => Ok(42)
 *
 * parseNumberLike(' 12.5 ')
 * // => Ok(12.5)
 *
 * parseNumberLike(true)
 * // => Err({ code: 'NOT_A_NUMBER', input: true, message: 'Expected a number or numeric text, got boolean' })
 *
 * parseNumberLike('12px')
 * // => Err({ code: 'NOT_A_NUMBER', input: '12px', message: 'Expected a number or numeric text, got "12px"' })
 * ```
 *
 * @tags number, coerce, unknown, json, numeric string, payload, spreadsheet, api
 * @see parseNumber - @ontologyio/receta/result, the text parse underneath
 * @see isFiniteNumber - @ontologyio/receta/predicate, the check for real numbers
 */
export function parseNumberLike(value: unknown): Result<number, ParseNumberLikeError> {
  const failure: ParseNumberLikeError = {
    code: 'NOT_A_NUMBER',
    input: value,
    message: `Expected a number or numeric text, got ${describe(value)}`,
  }
  if (isFiniteNumber(value)) return ok(value)
  if (isString(value)) return mapErr(parseNumber(value), () => failure)
  return err(failure)
}
