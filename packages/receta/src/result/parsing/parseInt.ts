import type { Result } from '../types'
import { ok, err } from '../constructors'
import { createParseNumberError, type ParseNumberError } from './types'

/**
 * Safely parses a string into an integer with optional radix.
 *
 * Unlike the global parseInt() which can return NaN or parse partial strings,
 * this function returns a Result with strict validation:
 * - The whole string must be an integer: an optional sign, then digits of the radix
 * - Nothing may follow the digits, so `'12abc'`, `'1e3'` and `'12.0'` are errors
 * - A `0x` prefix is accepted only in radix 16
 * - The value must fit in a safe integer, so it is exactly the number that was written
 * - Radix must be between 2 and 36
 *
 * Surrounding whitespace is trimmed, and leading zeros are allowed.
 *
 * @param str - The string to parse
 * @param radix - Optional radix (base) for parsing, between 2 and 36. Defaults to 10
 * @returns Result containing the parsed integer or a ParseNumberError
 *
 * @example
 * ```typescript
 * import { parseInt } from '@ontologyio/receta/result'
 *
 * // Decimal (default radix 10)
 * parseInt('123')
 * // => Ok(123)
 *
 * parseInt('-42')
 * // => Ok(-42)
 *
 * parseInt('0')
 * // => Ok(0)
 *
 * // Binary (radix 2)
 * parseInt('1010', 2)
 * // => Ok(10)
 *
 * parseInt('11111111', 2)
 * // => Ok(255)
 *
 * // Hexadecimal (radix 16)
 * parseInt('FF', 16)
 * // => Ok(255)
 *
 * parseInt('0x1A', 16)
 * // => Ok(26)
 *
 * // Octal (radix 8)
 * parseInt('77', 8)
 * // => Ok(63)
 *
 * // Failed parsing - not a number
 * parseInt('abc')
 * // Err with reason 'not_a_number'
 *
 * // Failed parsing - has decimal point
 * parseInt('123.45')
 * // Err with reason 'invalid_integer'
 *
 * // Failed parsing - something follows the digits (the global parseInt returns 12 and 1)
 * parseInt('12abc')
 * // Err with reason 'invalid_integer'
 *
 * parseInt('1e3')
 * // Err with reason 'invalid_integer'
 *
 * // Failed parsing - a digit the radix doesn't have
 * parseInt('102', 2)
 * // Err with reason 'invalid_integer'
 *
 * // Failed parsing - too large to hold exactly
 * parseInt('9007199254740993')
 * // Err with reason 'invalid_integer'
 *
 * // Failed parsing - invalid radix
 * parseInt('123', 1)
 * // Err with reason 'out_of_radix_range'
 *
 * parseInt('123', 37)
 * // Err with reason 'out_of_radix_range'
 *
 * // Use with pattern matching
 * pipe(
 *   parseInt('FF', 16),
 *   match({
 *     onOk: (n) => `Decimal: ${n}`,
 *     onErr: (e) => `Error: ${e.message}`
 *   })
 * )
 * // => 'Decimal: 255'
 * ```
 *
 * @see parseNumber - For parsing floating-point numbers
 */
export function parseInt(str: string, radix: number = 10): Result<number, ParseNumberError> {
  // Validate radix range
  if (radix < 2 || radix > 36) {
    return err(
      createParseNumberError(
        str,
        'out_of_radix_range',
        `Radix ${radix} is out of range (must be between 2 and 36)`
      )
    )
  }

  const trimmed = str.trim()

  // Empty string should fail
  if (trimmed === '') {
    return err(
      createParseNumberError(str, 'not_a_number', `Cannot parse empty string as an integer`)
    )
  }

  // Use global parseInt
  const num = globalThis.parseInt(trimmed, radix)

  if (Number.isNaN(num)) {
    return err(
      createParseNumberError(str, 'not_a_number', `Cannot parse "${str}" as an integer`)
    )
  }

  // The global parseInt stops at the first character it can't read, so '12abc' is 12 and
  // '1e3' is 1. The whole string has to be an integer.
  if (!integerPattern(radix).test(trimmed)) {
    return err(
      createParseNumberError(
        str,
        'invalid_integer',
        `Cannot parse "${str}" as an integer (not a whole number in base ${radix})`
      )
    )
  }

  if (!Number.isFinite(num)) {
    return err(createParseNumberError(str, 'infinite', `Number "${str}" is infinite`))
  }

  // Past this range a number can't hold every integer, so the digits would change silently.
  if (!Number.isSafeInteger(num)) {
    return err(
      createParseNumberError(
        str,
        'invalid_integer',
        `Cannot parse "${str}" as an integer (outside the safe integer range)`
      )
    )
  }

  return ok(num)
}

const RADIX_DIGITS = '0123456789abcdefghijklmnopqrstuvwxyz'

/**
 * Matches a whole integer in the given radix: a sign, a `0x` prefix in radix 16, then digits.
 */
function integerPattern(radix: number): RegExp {
  const digits = RADIX_DIGITS.slice(0, radix)
  const prefix = radix === 16 ? '(?:0x)?' : ''

  return new RegExp(`^[+-]?${prefix}[${digits}]+$`, 'i')
}
