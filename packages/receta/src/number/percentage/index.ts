import { instrumentedPurry } from '../../utils'

/**
 * Calculates what percentage one number is of another.
 *
 * Returns the percentage as a decimal (0.25 = 25%).
 * Returns 0 if the total is 0 to avoid division by zero.
 *
 * @param value - The part value
 * @param total - The total value
 * @returns The percentage as a decimal
 *
 * @example
 * ```typescript
 * // Data-first
 * percentage(25, 100) // => 0.25
 * percentage(1, 4) // => 0.25
 * percentage(10, 0) // => 0 (safe division)
 *
 * // Data-last (in pipe)
 * pipe(
 *   completed,
 *   percentage(total),
 *   toPercent(1)
 * ) // => "25.0%"
 *
 * // Real-world: Progress indicator
 * const progress = (current: number, total: number) =>
 *   pipe(
 *     percentage(current, total),
 *     (p) => p * 100,
 *     Math.round
 *   )
 * ```
 *
 * @see toPercent - for formatting as percentage string
 */
export function percentage(value: number, total: number): number
export function percentage(total: number): (value: number) => number
export function percentage(...args: unknown[]): unknown {
  return instrumentedPurry('percentage', 'number', percentageImpl, args)
}

function percentageImpl(value: number, total: number): number {
  if (total === 0) return 0
  return value / total
}
