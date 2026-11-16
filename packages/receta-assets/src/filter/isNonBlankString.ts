import { isString } from '@ontologyio/receta/predicate'
import { isBlank } from '@ontologyio/receta/string'

/**
 * Keeps strings with something besides whitespace, and tells TypeScript the value is a string.
 *
 * Use when: cleaning untyped input, such as a CSV column, a JSON array or form values, where
 * numbers, `null`, empty strings and stray spaces should all be dropped and the result typed
 * `string[]`. Whitespace includes tabs and newlines. It doesn't trim what it keeps.
 *
 * @example
 * ```ts
 * const cells: unknown[] = ['Ada', '   ', 42, null, '', 'Grace']
 *
 * R.filter(cells, isNonBlankString)
 * // => ['Ada', 'Grace']
 *
 * isNonBlankString('\n\t')
 * // => false
 * ```
 *
 * @tags string, blank, empty, whitespace, guard, clean, unknown, csv, filter
 * @see isBlank - @ontologyio/receta/string, the whitespace check for a known string
 */
export function isNonBlankString(value: unknown): value is string {
  return isString(value) && !isBlank(value)
}
