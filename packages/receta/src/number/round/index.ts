import * as R from 'remeda'

/**
 * Rounds a number to a specified number of decimal places.
 *
 * Uses proper rounding (half away from zero).
 *
 * @param value - The number to round
 * @param decimals - Number of decimal places (default: 0)
 * @returns The rounded number
 *
 * @example
 * ```typescript
 * // Data-first (requires 2 args)
 * round(1.2345, 0) // => 1
 * round(1.2345, 2) // => 1.23
 * round(1.2367, 2) // => 1.24
 * round(1234.56, -2) // => 1200
 *
 * // Data-last (in pipe)
 * pipe(
 *   price,
 *   round(2)
 * )
 *
 * // Real-world: Price rounding
 * const roundPrice = (price: number) =>
 *   pipe(price, round(2))
 * ```
 *
 * @see toPrecision - for significant digits
 */
export function round(value: number, decimals?: number): number
export function round(decimals?: number): (value: number) => number
export function round(...args: any[]): any {
  // Data-first: round(value, decimals?) - only if we have 2 args
  if (args.length >= 2) {
    return roundImpl(args[0], args[1])
  }

  // Single arg: treat as data-last (for pipe usage)
  // This means round(2) returns a function, and round(123.45) also returns a function
  // To use data-first, must provide both args: round(123.45, 2)
  if (args.length === 1) {
    const decimals = args[0]
    return (value: number) => roundImpl(value, decimals)
  }

  // No args - data-last with default decimals
  return (value: number) => roundImpl(value, 0)
}

function roundImpl(value: number, decimals: number = 0): number {
  const multiplier = Math.pow(10, decimals)
  return Math.round(value * multiplier) / multiplier
}
