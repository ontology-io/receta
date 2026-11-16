import * as R from 'remeda'
import { toCurrency } from '@ontologyio/receta/number'

export type FormatPriceOptions = {
  /** ISO 4217 code such as `USD`, `EUR` or `JPY`. */
  readonly currency: string
  /** BCP 47 locale such as `en-US` or `de-DE`; it sets the symbol position and separators. */
  readonly locale: string
}

/** How many minor units a currency has: 2 for USD (cents), 0 for JPY, 3 for KWD. */
const minorDigits = (currency: string): number =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).resolvedOptions().maximumFractionDigits ?? 2

/**
 * Formats an amount stored in minor units, such as cents, as a price: `1999` → `$19.99`.
 *
 * Use when: prices come from a database, Stripe or another payment API as integers in the
 * currency's smallest unit. The number of minor digits comes from the currency, so `1999`
 * yen stays `¥1,999` and `1999` cents become `$19.99`. The locale decides symbol position,
 * separators and spacing; some locales put a no-break space (` `) before the symbol.
 *
 * @example
 * ```ts
 * formatPrice(1999, { currency: 'USD', locale: 'en-US' })
 * // => '$19.99'
 *
 * formatPrice(123456, { currency: 'EUR', locale: 'de-DE' })
 * // => '1.234,56 €'
 *
 * R.pipe(1999, formatPrice({ currency: 'JPY', locale: 'en-US' }))
 * // => '¥1,999'
 * ```
 *
 * @tags price, money, currency, cents, minor units, format, stripe, checkout
 * @see toCurrency - @ontologyio/receta/number, formats an amount in major units
 * @see formatPriceRange - two prices as `$10 – $25`
 * @see toMinorUnits - turns `19.99` into `1999`
 */
export function formatPrice(minorUnits: number, options: FormatPriceOptions): string
export function formatPrice(options: FormatPriceOptions): (minorUnits: number) => string
export function formatPrice(...args: unknown[]): unknown {
  return R.purry(formatPriceImplementation, args)
}

const formatPriceImplementation = (minorUnits: number, { currency, locale }: FormatPriceOptions): string =>
  toCurrency(minorUnits / 10 ** minorDigits(currency), { currency, locale })
