import * as R from 'remeda'

/**
 * Rounds a number to the nearest multiple of a step value.
 *
 * Useful for quantizing values to specific increments like price steps,
 * slider values, or decimal quantization.
 *
 * @param value - The number to round
 * @param step - The step value to round to (must be > 0)
 * @returns The rounded number
 *
 * @example
 * ```typescript
 * // Data-first
 * roundTo(4.23, 0.25) // => 4.25
 * roundTo(4.22, 0.25) // => 4.25
 * roundTo(4.10, 0.25) // => 4.00
 * roundTo(127, 5) // => 125
 * roundTo(128, 5) // => 130
 * roundTo(1.234, 0.1) // => 1.2
 *
 * // Data-last (in pipe)
 * pipe(
 *   price,
 *   roundTo(0.25)
 * )
 *
 * // Real-world: Price quantization
 * const roundPrice = (price: number) =>
 *   pipe(price, roundTo(0.01)) // Round to nearest cent
 *
 * // Real-world: Slider step values
 * const quantizeSlider = (value: number, step: number) =>
 *   roundTo(value, step)
 * ```
 *
 * @see round - for decimal place rounding
 */
export function roundTo(value: number, step: number): number
export function roundTo(step: number): (value: number) => number
export function roundTo(...args: any[]): any {
  // Data-first: roundTo(value, step) - requires 2 args
  if (args.length >= 2) {
    return roundToImpl(args[0], args[1])
  }

  // Data-last: roundTo(step) - returns function
  if (args.length === 1) {
    const step = args[0]
    return (value: number) => roundToImpl(value, step)
  }

  throw new Error('roundTo requires 1 or 2 arguments')
}

function roundToImpl(value: number, step: number): number {
  if (step <= 0) {
    throw new Error(`roundTo step must be greater than 0, got ${step}`)
  }

  // Round to nearest multiple of step
  return Math.round(value / step) * step
}
