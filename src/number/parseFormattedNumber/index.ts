import type { Result } from '../../result/types'
import { ok, err } from '../../result/constructors'
import type { ParseError } from '../types'

/**
 * Parses a formatted number string (with thousands separators and currency symbols)
 * into a number.
 *
 * Handles:
 * - Thousands separators (commas, spaces, periods)
 * - Currency symbols ($ , £, €, etc.)
 * - Parentheses for negative numbers (accounting format)
 * - Decimal points
 * - Negative signs
 *
 * Returns Ok with the parsed number, or Err with ParseError if parsing fails.
 *
 * @param input - The formatted string to parse
 * @returns Result containing the parsed number or an error
 *
 * @example
 * ```typescript
 * // Basic formatted numbers
 * parseFormattedNumber("1,234.56") // => Ok(1234.56)
 * parseFormattedNumber("1 234.56") // => Ok(1234.56)
 * parseFormattedNumber("1.234,56") // => Ok(1234.56) - European format
 *
 * // Currency symbols
 * parseFormattedNumber("$1,234.56") // => Ok(1234.56)
 * parseFormattedNumber("£1,234.56") // => Ok(1234.56)
 * parseFormattedNumber("€1.234,56") // => Ok(1234.56)
 * parseFormattedNumber("1,234.56 USD") // => Ok(1234.56)
 *
 * // Negative numbers
 * parseFormattedNumber("-1,234.56") // => Ok(-1234.56)
 * parseFormattedNumber("(1,234.56)") // => Ok(-1234.56) - Accounting format
 *
 * // Invalid input
 * parseFormattedNumber("abc") // => Err({ code: 'PARSE_ERROR', ... })
 * parseFormattedNumber("") // => Err({ code: 'PARSE_ERROR', ... })
 *
 * // Real-world: Parse user input
 * const validatePrice = (input: string) =>
 *   pipe(
 *     parseFormattedNumber(input),
 *     flatMap(price =>
 *       price > 0 ? ok(price) : err({ code: 'INVALID_PRICE' })
 *     )
 *   )
 *
 * // Real-world: Parse financial report
 * const parseRevenue = (text: string) =>
 *   parseFormattedNumber(text) // "$1,234,567.89" => 1234567.89
 * ```
 *
 * @see fromString - for parsing simple number strings
 * @see fromCurrency - for parsing currency with specific locale
 */
export function parseFormattedNumber(
  input: string
): Result<number, ParseError> {
  const trimmed = input.trim()

  if (trimmed === '') {
    return err({
      code: 'PARSE_ERROR',
      message: 'Cannot parse empty string',
      input,
    })
  }

  // Check for accounting format (parentheses for negative)
  const isNegative = trimmed.startsWith('(') && trimmed.endsWith(')')
  let workingString = isNegative ? trimmed.slice(1, -1) : trimmed

  // Remove currency symbols and text
  // Common currency symbols: $ £ € ¥ ¢ ₹ ₽ etc.
  workingString = workingString.replace(/[A-Z]{3,}/g, '') // Remove currency codes (USD, EUR, etc.)
  workingString = workingString.replace(/[$£€¥¢₹₽₩₪₦₨₱฿₴₡₵₲₸₮₴]/g, '')

  // Detect decimal separator
  // If there's a comma followed by exactly 2 digits at the end, it's likely the decimal separator (European format)
  const europeanDecimalMatch = workingString.match(/,\d{2}$/)
  const usesCommaAsDecimal = europeanDecimalMatch !== null

  if (usesCommaAsDecimal) {
    // European format: 1.234,56
    // Remove periods (thousands separators) and replace comma with period
    workingString = workingString.replace(/\./g, '').replace(',', '.')
  } else {
    // US format: 1,234.56
    // Remove commas and spaces (thousands separators)
    workingString = workingString.replace(/[, ]/g, '')
  }

  // Remove any remaining whitespace
  workingString = workingString.trim()

  // Parse the cleaned string
  const parsed = Number(workingString)

  if (Number.isNaN(parsed)) {
    return err({
      code: 'PARSE_ERROR',
      message: `Cannot parse "${input}" as a number`,
      input,
    })
  }

  // Apply negative sign if in accounting format
  const result = isNegative ? -Math.abs(parsed) : parsed

  return ok(result)
}
