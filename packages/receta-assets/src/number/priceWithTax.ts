import * as R from 'remeda'
import { round } from '@ontologyio/receta/number'

export type PriceWithTaxBreakdown = {
  readonly net: number
  readonly tax: number
  readonly gross: number
}

/**
 * Adds tax to a net price in minor units and returns net, tax and gross that add up exactly.
 *
 * Use when: a price is stored before tax, as in US sales tax or B2B prices, and a checkout,
 * invoice or receipt needs every line. `rate` is a fraction, so 20% is `0.2`. The tax is
 * rounded to a whole minor unit, halves away from zero, and the gross is net plus that
 * rounded tax, so the three numbers on the receipt always agree. Negative net prices, such
 * as refunds, get negative tax.
 *
 * @example
 * ```ts
 * priceWithTax(1999, 0.2)
 * // => { net: 1999, tax: 400, gross: 2399 }
 *
 * priceWithTax(1050, 0.07)
 * // => { net: 1050, tax: 74, gross: 1124 }
 *
 * R.pipe(-1050, priceWithTax(0.07))
 * // => { net: -1050, tax: -74, gross: -1124 }
 * ```
 *
 * @tags tax, vat, sales tax, gst, net, gross, invoice, checkout, receipt, money
 * @see round - @ontologyio/receta/number, rounds the tax to a whole minor unit
 * @see priceWithoutTax - splits a price that already includes tax
 */
export function priceWithTax(net: number, rate: number): PriceWithTaxBreakdown
export function priceWithTax(rate: number): (net: number) => PriceWithTaxBreakdown
export function priceWithTax(...args: unknown[]): unknown {
  return R.purry(priceWithTaxImplementation, args)
}

const priceWithTaxImplementation = (net: number, rate: number): PriceWithTaxBreakdown => {
  // Rounding the size, then restoring the sign, rounds halves away from zero for refunds too.
  const size = round(Math.abs(net) * rate, 0)
  const tax = net < 0 ? 0 - size : size
  return { net, tax, gross: net + tax }
}
