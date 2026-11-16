import * as R from 'remeda'
import { isInteger, toCurrency } from '@ontologyio/receta/number'

export type FormatPriceRangeOptions = {
  /** ISO 4217 code such as `USD`, `EUR` or `JPY`. */
  readonly currency: string
  /** BCP 47 locale such as `en-US` or `de-DE`. */
  readonly locale: string
}

export type FormatPriceRangeBounds = {
  /** The lower price, in minor units such as cents. */
  readonly min: number
  /** The upper price, in minor units such as cents. */
  readonly max: number
}

const minorDigits = (currency: string): number =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).resolvedOptions().maximumFractionDigits ?? 2

/**
 * Formats a price range from minor units: `$10 – $25`, or one price when both ends match.
 *
 * Use when: a product with variants, a plan with tiers or a search filter shows "from–to"
 * prices. When both ends are whole amounts the decimals are dropped (`$10 – $25`);
 * otherwise both ends show them (`$9.99 – $25.00`), so the two always match. Ends given in
 * the wrong order are swapped. The dash is an en dash with spaces.
 *
 * @example
 * ```ts
 * formatPriceRange({ min: 1000, max: 2500 }, { currency: 'USD', locale: 'en-US' })
 * // => '$10 – $25'
 *
 * formatPriceRange({ min: 2500, max: 999 }, { currency: 'USD', locale: 'en-US' })
 * // => '$9.99 – $25.00'
 *
 * R.pipe({ min: 1999, max: 1999 }, formatPriceRange({ currency: 'USD', locale: 'en-US' }))
 * // => '$19.99'
 * ```
 *
 * @tags price, range, from, to, money, currency, variants, tiers, filter
 * @see toCurrency - @ontologyio/receta/number, formats each end
 * @see formatPrice - one price
 */
export function formatPriceRange(range: FormatPriceRangeBounds, options: FormatPriceRangeOptions): string
export function formatPriceRange(options: FormatPriceRangeOptions): (range: FormatPriceRangeBounds) => string
export function formatPriceRange(...args: unknown[]): unknown {
  return R.purry(formatPriceRangeImplementation, args)
}

const formatPriceRangeImplementation = (
  { min, max }: FormatPriceRangeBounds,
  { currency, locale }: FormatPriceRangeOptions,
): string => {
  const scale = 10 ** minorDigits(currency)
  const low = Math.min(min, max) / scale
  const high = Math.max(min, max) / scale
  const whole = isInteger(low) && isInteger(high)
  const show = (amount: number): string =>
    toCurrency(amount, whole ? { currency, locale, decimals: 0 } : { currency, locale })
  return low === high ? show(low) : `${show(low)} – ${show(high)}`
}
