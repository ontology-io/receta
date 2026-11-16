import * as R from 'remeda'
import { by, isEmpty, isNullish, not, or, type Predicate } from '@ontologyio/receta/predicate'
import { isBlank } from '@ontologyio/receta/string'

const isBlankText = (value: unknown): boolean => R.isString(value) && isBlank(value)
const isEmptyList = (value: unknown): boolean => R.isArray(value) && isEmpty(value)

/**
 * Builds a predicate that keeps items whose field holds something: not empty, blank or missing.
 *
 * Use when: listing records ready for a step that needs a field, such as products with a
 * photo, contacts with a phone number or posts with a summary. `null`, `undefined`, a blank
 * or whitespace-only string and an empty array count as empty; `0` and `false` count as filled.
 *
 * @example
 * ```ts
 * const contacts = [
 *   { name: 'Ada', phone: '+44 20 7946 0000' },
 *   { name: 'Grace', phone: '  ' },
 *   { name: 'Alan', phone: null },
 * ]
 *
 * R.map(R.filter(contacts, hasFilledField('phone')), R.prop('name'))
 * // => ['Ada']
 *
 * R.filter([{ score: 0 }, { score: undefined }], hasFilledField('score'))
 * // => [{ score: 0 }]
 * ```
 *
 * @tags filled, present, not empty, has value, complete, required, field, filter
 * @see isMissingField - keeps the items where the field is empty
 */
export function hasFilledField<K extends PropertyKey>(key: K): Predicate<{ readonly [P in K]?: unknown }> {
  return by((item) => item[key], not(or<unknown>(isNullish, isBlankText, isEmptyList)))
}
