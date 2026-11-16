import * as R from 'remeda'
import { format, round } from '@ontologyio/receta/number'

/**
 * Formats a difference with an explicit sign and separators: `+1,234`, `−56`, `0`.
 *
 * Use when: showing how a count or amount changed since the last period, such as new
 * signups, stock movement or a score difference. Positive values get `+`, negative ones
 * the typographic minus `−`, and a value that rounds to zero gets no sign. `decimals` sets
 * how many decimals to show.
 *
 * @example
 * ```ts
 * formatDelta(1234, 0)
 * // => '+1,234'
 *
 * formatDelta(-56.25, 1)
 * // => '−56.3'
 *
 * R.pipe(-0.004, formatDelta(2))
 * // => '0.00'
 * ```
 *
 * @tags delta, difference, change, sign, plus, minus, diff, kpi, trend
 * @see format - @ontologyio/receta/number, the digits and separators
 * @see round - @ontologyio/receta/number, rounds before the sign is chosen
 * @see formatPercentChange - the same signs for percentages
 */
export function formatDelta(delta: number, decimals: number): string
export function formatDelta(decimals: number): (delta: number) => string
export function formatDelta(...args: unknown[]): unknown {
  return R.purry(formatDeltaImplementation, args)
}

const formatDeltaImplementation = (delta: number, decimals: number): string => {
  // Rounding the size, not the signed value, rounds halves away from zero, as format does.
  const size = round(Math.abs(delta), decimals)
  const sign = size === 0 ? '' : delta > 0 ? '+' : '−'
  return `${sign}${format(size, { decimals, locale: 'en-US' })}`
}
