import type { Result } from '../result/types'
import { ok, err } from '../result/constructors'
import type { ParseError } from './types'

/**
 * Parses a currency string into a number.
 *
 * Strips currency symbols, grouping separators, and whitespace before parsing.
 * Handles common formats: "$1,234.56", "€1.234,56", "£1,234.56".
 *
 * @param input - The currency string to parse
 * @returns Result containing the parsed number or an error
 *
 * @example
 * ```typescript
 * fromCurrency("$1,234.56") // => Ok(1234.56)
 * fromCurrency("€1.234,56") // => Ok(1234.56) (European format)
 * fromCurrency("£1,234") // => Ok(1234)
 * fromCurrency("-$50.00") // => Ok(-50)
 * fromCurrency("invalid") // => Err({ code: 'PARSE_ERROR', ... })
 *
 * // Real-world: Parse Stripe amount string
 * const parseStripeAmount = (amountStr: string) =>
 *   pipe(
 *     fromCurrency(amountStr),
 *     map(amount => Math.round(amount * 100)) // Convert to cents
 *   )
 * ```
 *
 * @see fromString - for parsing plain number strings
 * @see toCurrency - for formatting numbers as currency
 */
export function fromCurrency(input: string): Result<number, ParseError> {
  const trimmed = input.trim()

  if (trimmed === '') {
    return err({
      code: 'PARSE_ERROR',
      message: 'Cannot parse empty string',
      input,
    })
  }

  // Remove currency symbols, spaces, and common grouping separators
  // Keep negative sign, digits, and decimal point
  let cleaned = trimmed
    // Remove currency symbols
    .replace(/[$€£¥₹₽₩¢]/g, '')
    // Remove spaces
    .replace(/\s/g, '')
    // Remove grouping separators (commas and periods in grouping positions)
    .replace(/,(?=\d{3}($|\D))/g, '')
    // Handle European format (period as grouping, comma as decimal)
    .replace(/\.(?=\d{3}($|\D))/g, '')
    .replace(/,(\d{1,2})$/, '.$1') // Replace final comma with period

  const parsed = Number(cleaned)

  if (Number.isNaN(parsed)) {
    return err({
      code: 'PARSE_ERROR',
      message: `Cannot parse "${input}" as a currency value`,
      input,
    })
  }

  return ok(parsed)
}
