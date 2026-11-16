import * as R from 'remeda'
import { filter, fromNullable, map, type Option } from '@ontologyio/receta/option'
import { not } from '@ontologyio/receta/predicate'
import { isBlank } from '@ontologyio/receta/string'

/**
 * Trims an optional text value and transforms it only when something is left, otherwise `None`.
 *
 * Use when: an optional form field, query parameter or CSV cell arrives as `null`, `undefined`,
 * `''` or spaces when the user left it empty, and only real content should be processed, such
 * as a coupon code to uppercase or a middle name to capitalize. The transform gets the trimmed
 * text and never runs for blank input.
 *
 * @example
 * ```ts
 * import { unwrapOr } from '@ontologyio/receta/option'
 *
 * mapNonBlank('  save10 ', (code) => code.toUpperCase())
 * // => Some('SAVE10')
 *
 * mapNonBlank('   ', (code) => code.toUpperCase())
 * // => None
 *
 * R.pipe(null, mapNonBlank((name: string) => name.length), unwrapOr(0))
 * // => 0
 * ```
 *
 * @tags optional, blank, empty, form field, trim, query param, nullable, input
 * @see isBlank - @ontologyio/receta/string, what counts as empty
 * @see fromNullable - @ontologyio/receta/option, `null` and `undefined` become `None`
 */
export function mapNonBlank<U>(
  text: string | null | undefined,
  transform: (trimmed: string) => U,
): Option<U>
export function mapNonBlank<U>(
  transform: (trimmed: string) => U,
): (text: string | null | undefined) => Option<U>
export function mapNonBlank(...args: unknown[]): unknown {
  return R.purry(mapNonBlankImplementation, args)
}

const mapNonBlankImplementation = <U>(
  text: string | null | undefined,
  transform: (trimmed: string) => U,
): Option<U> =>
  R.pipe(
    fromNullable(text),
    filter(not(isBlank)),
    map((present) => transform(present.trim())),
  )
