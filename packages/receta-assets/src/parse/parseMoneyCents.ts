import * as R from 'remeda'
import { isInteger, parseFormattedNumber, round } from '@ontologyio/receta/number'
import { err, flatMap, mapErr, ok, type Result } from '@ontologyio/receta/result'

export type ParseMoneyCentsError = {
  readonly code: 'NOT_AN_AMOUNT' | 'TOO_MANY_DECIMALS'
  readonly input: string
  readonly message: string
}

/** A comma before one digit, or before four or more: neither a decimal point nor a thousands group. */
const AMBIGUOUS_COMMA = /,(?:\d(?!\d)|\d{4,})/

const notAnAmount = (input: string): ParseMoneyCentsError => ({
  code: 'NOT_AN_AMOUNT',
  input,
  message: `Expected an amount such as 1,234.50, got "${input}"`,
})

/**
 * Parses a typed money amount such as `$1,234.50` or `1.234,50 €` into whole cents: 123450.
 *
 * Use when: a price, a payment or an invoice line comes in as text, from a form, a CSV
 * export or a bank statement, and the code stores money as integer minor units so sums
 * never drift. Currency symbols and codes, thousands separators and accounting brackets for
 * negatives, `(12.00)`, are understood; a comma followed by exactly two digits is read as the
 * decimal point, and `1,5 €` is refused rather than guessed. More than two decimals is
 * `TOO_MANY_DECIMALS` rather than a silent rounding.
 *
 * @example
 * ```ts
 * parseMoneyCents('$1,234.50')
 * // => Ok(123450)
 *
 * parseMoneyCents('1.234,50 €')
 * // => Ok(123450)
 *
 * parseMoneyCents('USD 12,50')
 * // => Ok(1250)
 *
 * parseMoneyCents('(0.29)')
 * // => Ok(-29)
 *
 * parseMoneyCents('1,5 €')
 * // => Err({ code: 'NOT_AN_AMOUNT', input: '1,5 €', message: 'Expected an amount such as 1,234.50, got "1,5 €"' })
 *
 * parseMoneyCents('12.345')
 * // => Err({ code: 'TOO_MANY_DECIMALS', input: '12.345', message: 'Expected at most 2 decimals, got "12.345"' })
 *
 * parseMoneyCents('twelve')
 * // => Err({ code: 'NOT_AN_AMOUNT', input: 'twelve', message: 'Expected an amount such as 1,234.50, got "twelve"' })
 * ```
 *
 * @tags money, currency, price, cents, amount, minor units, invoice, payment
 * @see parseFormattedNumber - @ontologyio/receta/number, reads the separators and symbols
 * @see toCurrency - @ontologyio/receta/number, formats the amount back for display
 */
export function parseMoneyCents(input: string): Result<number, ParseMoneyCentsError> {
  // Receta's parseFormattedNumber reads '12,50 €' as 1250 when a space is left after the
  // number, and '1,5' as 15, so spaces go first and an ambiguous comma is refused.
  const compact = input.replace(/\s+/g, '')
  if (AMBIGUOUS_COMMA.test(compact)) return err(notAnAmount(input))
  return R.pipe(
    parseFormattedNumber(compact),
    mapErr(() => notAnAmount(input)),
    // 0.29 * 100 is 28.999999999999996, so round away the float noise before the check.
    flatMap((amount) => {
      const cents = round(amount * 100, 6)
      return isInteger(cents)
        ? ok(cents)
        : err<ParseMoneyCentsError>({
            code: 'TOO_MANY_DECIMALS',
            input,
            message: `Expected at most 2 decimals, got "${input}"`,
          })
    }),
  )
}
