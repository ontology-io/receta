import * as R from 'remeda'
import { round } from '@ontologyio/receta/number'

export type PriceWithoutTaxBreakdown = {
  readonly net: number
  readonly tax: number
  readonly gross: number
}

/**
 * Splits a tax-inclusive price in minor units into net and tax that add up to it exactly.
 *
 * Use when: prices are shown with tax included, as with VAT in Europe or GST in Australia,
 * and an invoice or accounting export needs the net and the tax separately. `rate` is a
 * fraction, so 20% is `0.2`. The net is rounded to a whole minor unit, halves away from
 * zero, and the tax is what remains, so net plus tax is always the gross you passed in.
 *
 * @example
 * ```ts
 * priceWithoutTax(1999, 0.2)
 * // => { net: 1666, tax: 333, gross: 1999 }
 *
 * priceWithoutTax(1000, 0)
 * // => { net: 1000, tax: 0, gross: 1000 }
 *
 * R.pipe(11000, priceWithoutTax(0.1))
 * // => { net: 10000, tax: 1000, gross: 11000 }
 * ```
 *
 * @tags tax, vat, gst, net, gross, tax inclusive, invoice, accounting, money
 * @see round - @ontologyio/receta/number, rounds the net to a whole minor unit
 * @see priceWithTax - adds tax to a net price
 */
export function priceWithoutTax(gross: number, rate: number): PriceWithoutTaxBreakdown
export function priceWithoutTax(rate: number): (gross: number) => PriceWithoutTaxBreakdown
export function priceWithoutTax(...args: unknown[]): unknown {
  return R.purry(priceWithoutTaxImplementation, args)
}

const priceWithoutTaxImplementation = (gross: number, rate: number): PriceWithoutTaxBreakdown => {
  // Rounding the size, then restoring the sign, rounds halves away from zero for refunds too.
  const size = round(Math.abs(gross) / (1 + rate), 0)
  const net = gross < 0 ? 0 - size : size
  return { net, tax: gross - net, gross }
}
