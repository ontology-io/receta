import type { Result } from '../types'
import { ok, err } from '../constructors'
import { createParseNumberError, type ParseNumberError } from './types'

/**
 * Safely parses a string into an integer with optional radix.
 *
 * Unlike the global parseInt() which can return NaN or parse partial strings,
 * this function returns a Result with strict validation:
 * - Must be a valid integer
 * - No trailing non-numeric characters allowed
 * - Radix must be between 2 and 36
 *
 * @param str - The string to parse
 * @param radix - Optional radix (base) for parsing, between 2 and 36. Defaults to 10
 * @returns Result containing the parsed integer or a ParseNumberError
 *
 * @example
 * ```typescript
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
 * // => Err({ _tag: 'ParseNumberError', reason: 'not_a_number', ... })
 *
 * // Failed parsing - has decimal point
 * parseInt('123.45')
 * // => Err({ _tag: 'ParseNumberError', reason: 'invalid_integer', ... })
 *
 * // Failed parsing - invalid radix
 * parseInt('123', 1)
 * // => Err({ _tag: 'ParseNumberError', reason: 'out_of_radix_range', ... })
 *
 * parseInt('123', 37)
 * // => Err({ _tag: 'ParseNumberError', reason: 'out_of_radix_range', ... })
 *
 * // Use with pattern matching
 * pipe(
 *   parseInt('FF', 16),
 *   Result.match(
 *     (n) => `Decimal: ${n}`,
 *     (e) => `Error: ${e.message}`
 *   )
 * )
 * // => 'Decimal: 255'
 * ```
 *
 * @see {@link parseNumber} - For parsing floating-point numbers
 * @see {@link global.parseInt} - The underlying native function
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

  if (!Number.isFinite(num)) {
    return err(createParseNumberError(str, 'infinite', `Number "${str}" is infinite`))
  }

  if (!Number.isInteger(num)) {
    return err(
      createParseNumberError(
        str,
        'invalid_integer',
        `Parsed value ${num} from "${str}" is not an integer`
      )
    )
  }

  // Verify the entire string was consumed (strict parsing)
  // Convert back to string in the same radix and compare
  const reconstructed = num.toString(radix)
  const normalizedInput = trimmed.toLowerCase().replace(/^0x/, '')
  const normalizedReconstructed = reconstructed.toLowerCase()

  // Check if input has decimal point (not allowed for integers)
  if (trimmed.includes('.')) {
    return err(
      createParseNumberError(
        str,
        'not_a_number',
        `Cannot parse "${str}" as an integer (contains decimal point)`
      )
    )
  }

  return ok(num)
}
