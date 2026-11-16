import type { Result } from '../../result/types'
import { ok, err } from '../../result/constructors'
import type { ParseError } from '../types'

/**
 * Parses a formatted number string (with thousands separators and currency symbols)
 * into a number.
 *
 * Handles:
 * - Thousands separators (commas, periods, spaces, apostrophes)
 * - Currency symbols ($ , £, €, etc.) and codes (USD, EUR), before or after the number
 * - Parentheses for negative numbers (accounting format)
 * - Decimal points and decimal commas
 * - Negative signs
 *
 * How the separators are read:
 * - With both a comma and a period, the one written last is the decimal separator:
 *   `"1,234.56"` and `"1.234,56"` are both 1234.56
 * - A separator that appears more than once groups thousands: `"1,234,567"`, `"1.234.567"`
 * - A lone comma followed by exactly three digits groups thousands (`"1,234"` is 1234).
 *   Any other lone comma is a decimal comma: `"1,5"` is 1.5 and `"12,50"` is 12.5
 * - A lone period is always the decimal point: `"1.234"` is 1.234
 *
 * Returns Ok with the parsed number, or Err with ParseError if parsing fails. What is left
 * after the separators and the currency are removed has to be a plain, finite decimal
 * number, so `"Infinity"`, `"0x10"` and a bare `"$"` are errors.
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
 * // A lone comma
 * parseFormattedNumber("1,234") // => Ok(1234)
 * parseFormattedNumber("1,5") // => Ok(1.5)
 * parseFormattedNumber("12,50 €") // => Ok(12.5)
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
  const unwrapped = isNegative ? trimmed.slice(1, -1) : trimmed

  // Remove what only decorates the number: currency codes (USD, EUR), currency symbols,
  // and the spaces and apostrophes some locales group thousands with
  const digits = unwrapped
    .replace(/[A-Z]{3,}/g, '')
    .replace(/[$£€¥¢₹₽₩₪₦₨₱฿₴₡₵₲₸₮]/g, '')
    .replace(/[\s'’]/g, '')

  const normalized = withDecimalPoint(digits)

  // Number() also reads '', '0x10' and 'Infinity', none of which is a formatted number
  if (!PLAIN_DECIMAL.test(normalized)) {
    return err({
      code: 'PARSE_ERROR',
      message: `Cannot parse "${input}" as a number`,
      input,
    })
  }

  const parsed = Number(normalized)

  if (!Number.isFinite(parsed)) {
    return err({
      code: 'PARSE_ERROR',
      message: `Cannot parse "${input}" as a finite number`,
      input,
    })
  }

  // Apply negative sign if in accounting format
  const result = isNegative ? -Math.abs(parsed) : parsed

  return ok(result)
}

const PLAIN_DECIMAL = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i

// One comma, a group of one to three digits before it and exactly three after: 1,234
const LONE_THOUSANDS_COMMA = /^[+-]?[1-9]\d{0,2},\d{3}$/

/**
 * Rewrites the separators so that the only one left is a decimal point.
 */
function withDecimalPoint(digits: string): string {
  const commas = digits.split(',').length - 1
  const periods = digits.split('.').length - 1

  if (commas > 0 && periods > 0) {
    // The separator written last is the decimal one: 1,234.56 or 1.234,56
    return digits.lastIndexOf(',') > digits.lastIndexOf('.')
      ? digits.replaceAll('.', '').replaceAll(',', '.')
      : digits.replaceAll(',', '')
  }

  if (commas > 1) {
    return digits.replaceAll(',', '')
  }

  if (periods > 1) {
    return digits.replaceAll('.', '')
  }

  if (commas === 1) {
    return LONE_THOUSANDS_COMMA.test(digits) ? digits.replace(',', '') : digits.replace(',', '.')
  }

  return digits
}
