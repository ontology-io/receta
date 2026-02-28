import * as R from 'remeda'
import type { CompactOptions } from '../types'

/**
 * Formats a number in compact notation (K, M, B, T).
 *
 * Uses the Intl.NumberFormat API with compact notation.
 * For example, 1000 becomes "1K", 1000000 becomes "1M".
 *
 * @param value - The number to format
 * @param options - Compact formatting options
 * @returns The formatted compact string
 *
 * @example
 * ```typescript
 * // Data-first
 * toCompact(1000) // => "1K"
 * toCompact(1500) // => "2K"
 * toCompact(1000000) // => "1M"
 * toCompact(1234567, { digits: 2 }) // => "1.2M"
 * toCompact(1000, { notation: 'long' }) // => "1 thousand"
 *
 * // Data-last (in pipe)
 * pipe(
 *   followerCount,
 *   toCompact({ digits: 1 })
 * )
 *
 * // Real-world: Social media metrics
 * const displayCount = (count: number) =>
 *   count < 10000 ? count.toString() : toCompact(count)
 * ```
 *
 * @see format - for standard number formatting
 */
export function toCompact(value: number, options?: CompactOptions): string
export function toCompact(options?: CompactOptions): (value: number) => string
export function toCompact(...args: any[]): any {
  // Data-first: toCompact(value, options?)
  if (args.length >= 1 && typeof args[0] === 'number') {
    return toCompactImpl(args[0], args[1])
  }

  // Data-last: toCompact(options?)
  const options = args[0]
  return (value: number) => toCompactImpl(value, options)
}

function toCompactImpl(value: number, options: CompactOptions = {}): string {
  const { locale = 'en-US', digits = 1, notation = 'short' } = options

  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    compactDisplay: notation,
    maximumFractionDigits: digits,
  }).format(value)
}
