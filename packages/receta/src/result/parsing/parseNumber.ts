import type { Result } from '../types'
import { ok, err } from '../constructors'
import { createParseNumberError, type ParseNumberError } from './types'

/**
 * Safely parses a string into a number.
 *
 * Unlike Number() which can produce NaN or Infinity, this function returns a Result
 * that either contains a valid finite number or a descriptive error.
 *
 * @param str - The string to parse
 * @returns Result containing the parsed number or a ParseNumberError
 *
 * @example
 * ```typescript
 * // Successful parsing
 * parseNumber('123')
 * // => Ok(123)
 *
 * parseNumber('3.14')
 * // => Ok(3.14)
 *
 * parseNumber('-42.5')
 * // => Ok(-42.5)
 *
 * parseNumber('0')
 * // => Ok(0)
 *
 * // Scientific notation
 * parseNumber('1.5e10')
 * // => Ok(15000000000)
 *
 * // Failed parsing - not a number
 * parseNumber('abc')
 * // Err with reason 'not_a_number'
 *
 * parseNumber('')
 * // Err with reason 'not_a_number'
 *
 * // Failed parsing - infinite
 * parseNumber('Infinity')
 * // Err with reason 'infinite'
 *
 * parseNumber('-Infinity')
 * // Err with reason 'infinite'
 *
 * // Use in validation pipelines
 * pipe(
 *   parseNumber('42'),
 *   flatMap(n => n > 0 ? ok(n) : err('Must be positive'))
 * )
 * // => Ok(42)
 * ```
 *
 * @see parseInt - For parsing integers with radix support
 */
export function parseNumber(str: string): Result<number, ParseNumberError> {
  const trimmed = str.trim()

  // Empty string should fail
  if (trimmed === '') {
    return err(
      createParseNumberError(str, 'not_a_number', `Cannot parse empty string as a number`)
    )
  }

  const num = Number(trimmed)

  if (Number.isNaN(num)) {
    return err(
      createParseNumberError(str, 'not_a_number', `Cannot parse "${str}" as a number`)
    )
  }

  if (!Number.isFinite(num)) {
    return err(createParseNumberError(str, 'infinite', `Number "${str}" is infinite`))
  }

  return ok(num)
}
