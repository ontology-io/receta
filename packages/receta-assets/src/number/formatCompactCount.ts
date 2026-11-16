import * as R from 'remeda'
import { toCompact } from '@ontologyio/receta/number'

/**
 * Shortens a count the way social apps do: `1.2K`, `12K`, `123K`, `1.5M`, and `999` as is.
 *
 * Use when: showing followers, views, likes or downloads in a tight spot such as a badge
 * or a button. A decimal is shown only while the leading number is a single digit, so the
 * text stays short: `1.2K` but `12K`, never `12.3K`. Values round to the nearest shown
 * digit, so `9,999` reads `10K`. The locale sets the suffixes, such as `1,2 k` in French.
 *
 * @example
 * ```ts
 * formatCompactCount(1234, 'en-US')
 * // => '1.2K'
 *
 * formatCompactCount(12_345, 'en-US')
 * // => '12K'
 *
 * formatCompactCount(1_530_000, 'en-US')
 * // => '1.5M'
 *
 * R.pipe(999, formatCompactCount('en-US'))
 * // => '999'
 * ```
 *
 * @tags compact, abbreviate, followers, views, likes, count, short number, k, m
 * @see toCompact - @ontologyio/receta/number, the compact notation
 */
export function formatCompactCount(count: number, locale: string): string
export function formatCompactCount(locale: string): (count: number) => string
export function formatCompactCount(...args: unknown[]): unknown {
  return R.purry(formatCompactCountImplementation, args)
}

const formatCompactCountImplementation = (count: number, locale: string): string => {
  const magnitude = Math.abs(count)
  // The number before the suffix: 1.234 for 1,234 and 12.345 for 12,345.
  const leading = magnitude < 1000 ? magnitude : magnitude / 1000 ** Math.floor(Math.log10(magnitude) / 3)
  return toCompact(count, { locale, digits: leading < 10 ? 1 : 0 })
}
