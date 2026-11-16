import * as R from 'remeda'
import { format, round } from '@ontologyio/receta/number'

/**
 * Formats a change ratio as a signed percentage: `0.125` → `+12.5%`, `-0.03` → `−3.0%`.
 *
 * Use when: a dashboard, report or price ticker shows how much a metric went up or down.
 * The input is a ratio, so `0.125` means 12.5%. The sign is decided after rounding, so a
 * change too small to show reads `0.0%`, never `-0.0%` or `+0.0%`. Negatives use the
 * typographic minus `−`, which lines up with `+` in tables. Large values get separators.
 *
 * @example
 * ```ts
 * formatPercentChange(0.125, 1)
 * // => '+12.5%'
 *
 * formatPercentChange(-0.03, 1)
 * // => '−3.0%'
 *
 * formatPercentChange(-0.0001, 1)
 * // => '0.0%'
 *
 * R.pipe(12.3456, formatPercentChange(0))
 * // => '+1,235%'
 * ```
 *
 * @tags percent, change, delta, growth, trend, kpi, dashboard, sign, increase, decrease
 * @see round - @ontologyio/receta/number, rounds before the sign is chosen
 * @see format - @ontologyio/receta/number, the digits and separators
 * @see growthRate - computes the ratio from two values
 * @see formatDelta - the same signs for plain counts
 */
export function formatPercentChange(ratio: number, decimals: number): string
export function formatPercentChange(decimals: number): (ratio: number) => string
export function formatPercentChange(...args: unknown[]): unknown {
  return R.purry(formatPercentChangeImplementation, args)
}

const formatPercentChangeImplementation = (ratio: number, decimals: number): string => {
  // Rounding the size, not the signed value, rounds halves away from zero, as format does.
  const size = round(Math.abs(ratio * 100), decimals)
  const sign = size === 0 ? '' : ratio > 0 ? '+' : '−'
  return `${sign}${format(size, { decimals, locale: 'en-US' })}%`
}
