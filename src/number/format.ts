import * as R from 'remeda'
import type { FormatOptions } from './types'

/**
 * Formats a number with specified decimal places and grouping.
 *
 * Uses the Intl.NumberFormat API for locale-aware formatting.
 *
 * @param value - The number to format
 * @param options - Formatting options
 * @returns The formatted number string
 *
 * @example
 * ```typescript
 * // Data-first
 * format(1234.5678) // => "1,234.57"
 * format(1234.5678, { decimals: 0 }) // => "1,235"
 * format(1234.5678, { useGrouping: false }) // => "1234.57"
 * format(1234.5678, { locale: 'de-DE' }) // => "1.234,57"
 *
 * // Data-last (in pipe)
 * pipe(
 *   price,
 *   format({ decimals: 2 })
 * ) // => formatted price
 * ```
 *
 * @see toCurrency - for currency-specific formatting
 * @see toPercent - for percentage formatting
 */
export function format(value: number, options?: FormatOptions): string
export function format(options?: FormatOptions): (value: number) => string
export function format(...args: any[]): any {
  // Data-first: format(value, options?)
  if (args.length >= 1 && typeof args[0] === 'number') {
    return formatImpl(args[0], args[1])
  }

  // Data-last: format(options?)
  const options = args[0]
  return (value: number) => formatImpl(value, options)
}

function formatImpl(value: number, options: FormatOptions = {}): string {
  const {
    decimals = 2,
    useGrouping = true,
    locale = 'en-US',
    minimumFractionDigits = decimals,
    maximumFractionDigits = decimals,
  } = options

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits,
    maximumFractionDigits,
    useGrouping,
  }).format(value)
}
