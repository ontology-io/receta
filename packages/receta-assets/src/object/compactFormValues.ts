import * as R from 'remeda'
import { mapValues, stripEmpty, type DeepPartial, type PlainObject } from '@ontologyio/receta/object'
import { isNullish, isString, not, or } from '@ontologyio/receta/predicate'

const isBlank = (value: unknown): boolean => isString(value) && value === ''
const isBlankOrNullish = or(isNullish, isBlank)

const trimDeep = (value: unknown): unknown => {
  if (isString(value)) return value.trim()
  if (R.isArray(value)) return R.pipe(value, R.map(trimDeep), R.filter(not(isBlankOrNullish)))
  if (R.isPlainObject(value)) return mapValues(value, trimDeep)
  return value
}

/**
 * Trims every string in submitted form values, then drops what is left empty, at any depth.
 *
 * Use when: turning raw form or query input into a payload, where an untouched field arrives
 * as `''` or `'   '` and should be left out rather than saved. Strings are trimmed at the
 * ends only. Then `null`, `undefined`, `''`, `[]` and `{}` are removed, and so is an object
 * that only held empty fields. Inside arrays, blank and nullish items are dropped. `0` and
 * `false` are answers, so they stay.
 *
 * @example
 * ```ts
 * const submitted = {
 *   name: '  Ada Lovelace ',
 *   nickname: '   ',
 *   age: 0,
 *   newsletter: false,
 *   address: { street: '', city: ' London' },
 *   phone: { home: '', work: '' },
 *   tags: ['math', ' ', ' poetry '],
 * }
 *
 * compactFormValues(submitted)
 * // => { name: 'Ada Lovelace', age: 0, newsletter: false, address: { city: 'London' }, tags: ['math', 'poetry'] }
 *
 * compactFormValues({ q: '', page: undefined })
 * // => {}
 * ```
 *
 * @tags form, trim, empty, blank, compact, clean, payload, submit, sanitize, whitespace
 * @see stripEmpty - @ontologyio/receta/object, the empty-value removal after the trim
 * @see pickDefined - keeps '' and drops only undefined, for chosen keys
 */
export function compactFormValues<T extends object>(values: T): DeepPartial<T> {
  return stripEmpty(trimDeep(values) as PlainObject) as DeepPartial<T>
}
