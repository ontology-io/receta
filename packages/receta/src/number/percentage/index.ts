import type { PercentageOptions } from '../types'
import { shiftDecimal } from '../decimal'

/**
 * Calculates what percentage one number is of another.
 *
 * Returns a number out of 100: `percentage(29, 100)` is 29.
 * Returns 0 if the total is 0 to avoid division by zero.
 *
 * Pass `{ fraction: true }` as the last argument for a fraction of 1 instead (`0.29`).
 * That is the number `toPercent` formats.
 *
 * @param value - The part value
 * @param total - The total value
 * @param options - `fraction: true` returns a fraction of 1 instead of a number out of 100
 * @returns The percentage, out of 100 unless `fraction` is set
 *
 * @example
 * ```typescript
 * // Data-first
 * percentage(25, 100) // => 25
 * percentage(1, 4) // => 25
 * percentage(1, 8) // => 12.5
 * percentage(10, 0) // => 0 (safe division)
 *
 * // As a fraction of 1
 * percentage(25, 100, { fraction: true }) // => 0.25
 *
 * // Data-last (in pipe)
 * pipe(
 *   completed,
 *   percentage(total)
 * ) // => 25
 *
 * // toPercent formats a fraction
 * pipe(
 *   completed,
 *   percentage(total, { fraction: true }),
 *   toPercent(1)
 * ) // => "25.0%"
 *
 * // Real-world: Progress indicator
 * const progress = (current: number, total: number) =>
 *   pipe(
 *     percentage(current, total),
 *     round()
 *   )
 * ```
 *
 * @see toPercent - for formatting a fraction as a percentage string
 * @see ratio - for dividing two numbers with the same zero handling
 */
export function percentage(value: number, total: number, options?: PercentageOptions): number
export function percentage(total: number, options?: PercentageOptions): (value: number) => number
export function percentage(...args: unknown[]): unknown {
  // Data-first has the total as its second argument. Data-last has the options there, or nothing.
  if (typeof args[1] === 'number') {
    return percentageImpl(args[0] as number, args[1], args[2] as PercentageOptions | undefined)
  }

  const total = args[0] as number
  const options = args[1] as PercentageOptions | undefined
  return (value: number) => percentageImpl(value, total, options)
}

function percentageImpl(value: number, total: number, options: PercentageOptions = {}): number {
  if (total === 0) return 0

  if (options.fraction === true) {
    return value / total
  }

  // Scale the value first: (29 / 100) * 100 is 28.999999999999996. And scale it by moving
  // the decimal point, because 0.57 * 100 is 56.99999999999999.
  const scaled = shiftDecimal(value, 2)

  // NaN, the infinities and a value at the top of the number range can't be scaled first
  return Number.isFinite(scaled) ? scaled / total : (value / total) * 100
}
