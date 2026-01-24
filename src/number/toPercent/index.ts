import * as R from 'remeda'

/**
 * Formats a number as a percentage.
 *
 * Multiplies the value by 100 and adds a percent sign.
 * For example, 0.25 becomes "25%", 1.5 becomes "150%".
 *
 * @param value - The number to format as percentage (0.5 = 50%)
 * @param decimals - Number of decimal places (default: 0)
 * @returns The formatted percentage string
 *
 * @example
 * ```typescript
 * // Data-first (requires 2 args)
 * toPercent(0.25, 0) // => "25%"
 * toPercent(0.1234, 2) // => "12.34%"
 * toPercent(1.5, 0) // => "150%"
 * toPercent(0.333333, 1) // => "33.3%"
 *
 * // Data-last (in pipe)
 * pipe(
 *   conversionRate,
 *   toPercent(2)
 * )
 *
 * // Real-world: Analytics dashboard
 * const successRate = (successful: number, total: number) =>
 *   pipe(
 *     successful / total,
 *     toPercent(1)
 *   )
 * ```
 *
 * @see percentage - for calculating percentages
 */
export function toPercent(value: number, decimals?: number): string
export function toPercent(decimals?: number): (value: number) => string
export function toPercent(...args: any[]): any {
  // Data-first: toPercent(value, decimals?) - needs 2 args
  if (args.length >= 2) {
    return toPercentImpl(args[0], args[1])
  }

  // Single arg or no arg: data-last
  const decimals = args[0]
  return (value: number) => toPercentImpl(value, decimals)
}

function toPercentImpl(value: number, decimals: number = 0): string {
  const percent = value * 100
  return `${percent.toFixed(decimals)}%`
}
