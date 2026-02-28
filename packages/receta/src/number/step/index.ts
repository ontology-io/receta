import * as R from 'remeda'

/**
 * Rounds a number to the nearest step value.
 *
 * Useful for pricing, UI sliders, or any value that should snap to specific increments.
 *
 * @param value - The number to round
 * @param stepSize - The step increment
 * @returns The value rounded to the nearest step
 *
 * @example
 * ```typescript
 * // Data-first
 * step(7, 5) // => 5
 * step(8, 5) // => 10
 * step(1.23, 0.25) // => 1.25
 * step(1.22, 0.25) // => 1.25
 *
 * // Data-last (in pipe)
 * pipe(
 *   sliderValue,
 *   step(5)
 * )
 *
 * // Real-world: Price rounding to .99
 * const roundToNinetyNine = (price: number) =>
 *   Math.ceil(price) - 0.01
 *
 * // Step pricing (e.g., $5 increments)
 * const roundToFiveDollars = (price: number) =>
 *   step(price, 5)
 * ```
 *
 * @see round - for decimal place rounding
 * @see clamp - for constraining to a range
 */
export function step(value: number, stepSize: number): number
export function step(stepSize: number): (value: number) => number
export function step(...args: unknown[]): unknown {
  return R.purry(stepImpl, args)
}

function stepImpl(value: number, stepSize: number): number {
  return Math.round(value / stepSize) * stepSize
}
