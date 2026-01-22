import type { Result } from '../result/types'
import { ok, err } from '../result/constructors'
import type { ParseError } from './types'

/**
 * Parses a string into a number.
 *
 * Returns Ok with the parsed number, or Err with ParseError if parsing fails.
 * Handles common number formats including decimals, negatives, and scientific notation.
 *
 * @param input - The string to parse
 * @returns Result containing the parsed number or an error
 *
 * @example
 * ```typescript
 * fromString("123") // => Ok(123)
 * fromString("123.45") // => Ok(123.45)
 * fromString("-42") // => Ok(-42)
 * fromString("1.23e4") // => Ok(12300)
 * fromString("abc") // => Err({ code: 'PARSE_ERROR', ... })
 * fromString("") // => Err({ code: 'PARSE_ERROR', ... })
 *
 * // Real-world: Form input validation
 * const validatePrice = (input: string) =>
 *   pipe(
 *     fromString(input),
 *     flatMap(price =>
 *       price > 0 ? ok(price) : err({ code: 'INVALID_PRICE' })
 *     )
 *   )
 * ```
 *
 * @see fromCurrency - for parsing currency strings
 */
export function fromString(input: string): Result<number, ParseError> {
  const trimmed = input.trim()

  if (trimmed === '') {
    return err({
      code: 'PARSE_ERROR',
      message: 'Cannot parse empty string',
      input,
    })
  }

  const parsed = Number(trimmed)

  if (Number.isNaN(parsed)) {
    return err({
      code: 'PARSE_ERROR',
      message: `Cannot parse "${input}" as a number`,
      input,
    })
  }

  return ok(parsed)
}
