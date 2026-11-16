import * as R from 'remeda'
import { by, isEmpty, isNullish, or, type Predicate } from '@ontologyio/receta/predicate'
import { isBlank } from '@ontologyio/receta/string'

const isBlankText = (value: unknown): boolean => R.isString(value) && isBlank(value)
const isEmptyList = (value: unknown): boolean => R.isArray(value) && isEmpty(value)

/**
 * Builds a predicate that keeps items whose field is empty: missing, `null`, blank or an empty list.
 *
 * Use when: finding records that need attention, such as products without images, users
 * without a verified email or articles without tags, for a cleanup list or a data-quality
 * report. `null`, `undefined`, a blank or whitespace-only string and an empty array count as
 * empty; `0` and `false` don't.
 *
 * @example
 * ```ts
 * const products = [
 *   { sku: 'A1', images: ['a1.jpg'] },
 *   { sku: 'B2', images: [] },
 *   { sku: 'C3' },
 * ]
 *
 * R.map(R.filter(products, isMissingField('images')), R.prop('sku'))
 * // => ['B2', 'C3']
 *
 * R.filter([{ discount: 0 }, { discount: null }], isMissingField('discount'))
 * // => [{ discount: null }]
 * ```
 *
 * @tags missing, empty, blank, null, incomplete, data quality, cleanup, field, filter
 * @see hasFilledField - keeps the items where the field is filled
 */
export function isMissingField<K extends PropertyKey>(key: K): Predicate<{ readonly [P in K]?: unknown }> {
  return by((item) => item[key], or<unknown>(isNullish, isBlankText, isEmptyList))
}
