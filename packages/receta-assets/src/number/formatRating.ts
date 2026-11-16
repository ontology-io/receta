import * as R from 'remeda'
import { clamp, format } from '@ontologyio/receta/number'

/**
 * Formats an average rating with one decimal against its scale: `4.5 / 5`.
 *
 * Use when: showing a product, app or restaurant rating next to stars or in a review
 * summary. The rating rounds to one decimal, always shown, so ratings line up in a list
 * (`4.0 / 5`, not `4 / 5`). A rating outside `0` to `outOf` is clamped, so a bad average
 * can't read `5.3 / 5`.
 *
 * @example
 * ```ts
 * formatRating(4.47, 5)
 * // => '4.5 / 5'
 *
 * formatRating(4, 5)
 * // => '4.0 / 5'
 *
 * R.pipe(10.4, formatRating(10))
 * // => '10.0 / 10'
 * ```
 *
 * @tags rating, stars, review, score, average, out of, format
 * @see clamp - @ontologyio/receta/number, keeps the rating on its scale
 * @see format - @ontologyio/receta/number, the one decimal
 */
export function formatRating(rating: number, outOf: number): string
export function formatRating(outOf: number): (rating: number) => string
export function formatRating(...args: unknown[]): unknown {
  return R.purry(formatRatingImplementation, args)
}

const formatRatingImplementation = (rating: number, outOf: number): string =>
  `${format(clamp(rating, 0, outOf), { decimals: 1, locale: 'en-US' })} / ${outOf}`
