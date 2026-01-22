import * as R from 'remeda'
import type { CurrencyOptions } from './types'

/**
 * Formats a number as currency with the specified currency code and locale.
 *
 * Uses the Intl.NumberFormat API for locale-aware currency formatting.
 *
 * @param value - The number to format as currency
 * @param options - Currency formatting options
 * @returns The formatted currency string
 *
 * @example
 * ```typescript
 * // Data-first
 * toCurrency(1234.56, { currency: 'USD' }) // => "$1,234.56"
 * toCurrency(1234.56, { currency: 'EUR', locale: 'de-DE' }) // => "1.234,56 €"
 * toCurrency(1234.56, { currency: 'GBP' }) // => "£1,234.56"
 * toCurrency(1234, { currency: 'JPY' }) // => "¥1,234" (no decimals)
 *
 * // Data-last (in pipe)
 * pipe(
 *   orderTotal,
 *   toCurrency({ currency: 'USD' })
 * )
 *
 * // Real-world: Stripe checkout
 * const displayPrice = (amountInCents: number) =>
 *   pipe(
 *     amountInCents,
 *     (n) => n / 100,
 *     toCurrency({ currency: 'USD' })
 *   )
 * ```
 *
 * @see format - for general number formatting
 */
export function toCurrency(value: number, options: CurrencyOptions): string
export function toCurrency(options: CurrencyOptions): (value: number) => string
export function toCurrency(...args: unknown[]): unknown {
  return R.purry(toCurrencyImpl, args)
}

function toCurrencyImpl(value: number, options: CurrencyOptions): string {
  const {
    currency,
    locale = 'en-US',
    showSymbol = true,
    decimals,
  } = options

  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    currencyDisplay: showSymbol ? 'symbol' : 'code',
    ...(decimals !== undefined && {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }),
  })

  return formatter.format(value)
}
