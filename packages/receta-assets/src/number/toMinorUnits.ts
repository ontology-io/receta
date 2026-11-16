import * as R from 'remeda'
import { round } from '@ontologyio/receta/number'

const minorDigits = (currency: string): number =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).resolvedOptions().maximumFractionDigits ?? 2

/**
 * Converts an amount in major units, such as dollars, to whole minor units: `19.99` USD → `1999`.
 *
 * Use when: sending an amount to Stripe or another payment API, or storing money as an
 * integer, from a number a form or a calculation produced. The minor digits come from the
 * currency: 2 for USD and EUR, 0 for JPY, 3 for KWD. Floating-point noise is settled
 * first, so `0.1 + 0.2` dollars is `30` cents and `19.99` is `1999`, not `1998`. Extra
 * precision rounds to the nearest minor unit, halves up.
 *
 * @example
 * ```ts
 * toMinorUnits(19.99, 'USD')
 * // => 1999
 *
 * toMinorUnits(0.1 + 0.2, 'USD')
 * // => 30
 *
 * R.pipe(1999, toMinorUnits('JPY'))
 * // => 1999
 *
 * toMinorUnits(1.2345, 'KWD')
 * // => 1235
 * ```
 *
 * @tags money, cents, minor units, stripe, currency, integer, amount, convert
 * @see round - @ontologyio/receta/number, settles the floating-point noise
 * @see formatPrice - formats minor units back into a price
 */
export function toMinorUnits(amount: number, currency: string): number
export function toMinorUnits(currency: string): (amount: number) => number
export function toMinorUnits(...args: unknown[]): unknown {
  return R.purry(toMinorUnitsImplementation, args)
}

const toMinorUnitsImplementation = (amount: number, currency: string): number =>
  Math.round(round(amount * 10 ** minorDigits(currency), 6))
