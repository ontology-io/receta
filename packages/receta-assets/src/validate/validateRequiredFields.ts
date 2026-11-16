import * as R from 'remeda'
import { isEmpty, isNullish, or } from '@ontologyio/receta/predicate'
import { capitalize, isBlank, snakeCase, words } from '@ontologyio/receta/string'
import { invalid, valid, type FieldError, type Validation } from '@ontologyio/receta/validation'

/** `firstName` and `first_name` both read as `First name`. */
const labelOf = (key: string): string => capitalize(R.join(words(snakeCase(key)), ' '))

const isBlankText = (value: unknown): boolean => R.isString(value) && isBlank(value)
const isEmptyList = (value: unknown): boolean => R.isArray(value) && isEmpty(value)
const isMissing = or<unknown>(isNullish, isBlankText, isEmptyList)

/**
 * Checks that the named fields of a record are filled in, with one "X is required" per gap.
 *
 * Use when: a form or request body has several required fields whose own format is checked
 * elsewhere, and you want every missing one reported together. `null`, `undefined`, a blank
 * string and an empty array count as missing; `0` and `false` count as filled. Messages turn
 * the key into words: `firstName` becomes "First name is required".
 *
 * @example
 * ```ts
 * validateRequiredFields({ firstName: 'Ada', lastName: ' ', email: undefined }, ['firstName', 'lastName', 'email'])
 * // => Invalid([
 * //   { field: 'lastName', errors: ['Last name is required'] },
 * //   { field: 'email', errors: ['Email is required'] },
 * // ])
 *
 * R.pipe({ title: 'Launch', tags: ['news'], draft: false }, validateRequiredFields(['title', 'tags', 'draft']))
 * // => Valid({ title: 'Launch', tags: ['news'], draft: false })
 * ```
 *
 * @tags required, missing, blank, fields, form, payload, presence, mandatory
 * @see validateAtLeastOne - one of several fields is enough
 * @see validateAllOrNone - fields that must be filled together
 */
export function validateRequiredFields<T extends object>(
  record: T,
  keys: readonly (keyof T & string)[],
): Validation<T, FieldError<string>>
export function validateRequiredFields<T extends object>(
  keys: readonly (keyof T & string)[],
): (record: T) => Validation<T, FieldError<string>>
export function validateRequiredFields(...args: unknown[]): unknown {
  return R.purry(validateRequiredFieldsImplementation, args)
}

const validateRequiredFieldsImplementation = <T extends object>(
  record: T,
  keys: readonly (keyof T & string)[],
): Validation<T, FieldError<string>> => {
  const missing = R.pipe(
    keys,
    R.filter((key) => isMissing(record[key])),
    R.map((key): FieldError<string> => ({ field: key, errors: [`${labelOf(key)} is required`] })),
  )
  return R.isEmpty(missing) ? valid(record) : invalid(missing)
}
