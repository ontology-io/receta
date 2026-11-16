import * as R from 'remeda'
import { round } from '@ontologyio/receta/number'

/** Decimals in the step itself, so `0.05` rounds results to 2 places. */
const decimalsOf = (step: number): number => (String(step).split('.')[1] ?? '').length

/**
 * Rounds a price to the nearest multiple of a step, such as 0.05, without floating-point noise.
 *
 * Use when: cash rounding to 5 cents (Switzerland, Canada, Australia), rounding converted
 * prices to tidy steps such as `0.25`, or snapping a slider value to its step. Halves
 * round up. The result has no more decimals than the step, so `1.13` to `0.05` gives
 * `1.15`, not `1.1500000000000001`, and `1.015` to `0.01` gives `1.02`, not `1.01`. A step
 * of zero or less leaves the amount unchanged.
 *
 * @example
 * ```ts
 * roundPrice(1.13, 0.05)
 * // => 1.15
 *
 * roundPrice(1.015, 0.01)
 * // => 1.02
 *
 * R.pipe(7.3, roundPrice(0.25))
 * // => 7.25
 *
 * roundPrice(19.97, 0.1)
 * // => 20
 * ```
 *
 * @tags round, price, cash rounding, nickel, step, increment, money, snap
 * @see round - @ontologyio/receta/number, rounds the quotient and cleans the result
 * @see roundTo - @ontologyio/receta/number, the same idea, with floating-point noise
 */
export function roundPrice(amount: number, step: number): number
export function roundPrice(step: number): (amount: number) => number
export function roundPrice(...args: unknown[]): unknown {
  return R.purry(roundPriceImplementation, args)
}

const roundPriceImplementation = (amount: number, step: number): number => {
  if (step <= 0) return amount
  // 1.015 / 0.01 is 101.49999999999999; settling it to 9 places first makes it the 101.5 it means.
  const steps = Math.round(round(amount / step, 9))
  return round(steps * step, decimalsOf(step))
}
