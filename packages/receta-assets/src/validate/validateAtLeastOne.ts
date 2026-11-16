import * as R from 'remeda'
import { isEmpty, isNullish, not, or } from '@ontologyio/receta/predicate'
import { capitalize, isBlank, snakeCase, words } from '@ontologyio/receta/string'
import { invalid, valid, type FieldError, type Validation } from '@ontologyio/receta/validation'

/** `phoneNumber` and `phone_number` both read as `Phone number`. */
const labelOf = (key: string): string => capitalize(R.join(words(snakeCase(key)), ' '))

const isBlankText = (value: unknown): boolean => R.isString(value) && isBlank(value)
const isEmptyList = (value: unknown): boolean => R.isArray(value) && isEmpty(value)
const isFilled = not(or<unknown>(isNullish, isBlankText, isEmptyList))

/**
 * Checks that at least one of several alternative fields is filled in, and flags them all if none is.
 *
 * Use when: a form accepts one of a few ways to do the same thing, such as an email or a phone
 * number to reach someone, or a file or a link for an attachment. When none is filled, each
 * listed field gets the same message, so every one of them lights up. `null`, `undefined`, a
 * blank string and an empty array count as empty.
 *
 * @example
 * ```ts
 * validateAtLeastOne({ email: '', phoneNumber: '+14155550123' }, ['email', 'phoneNumber'])
 * // => Valid({ email: '', phoneNumber: '+14155550123' })
 *
 * validateAtLeastOne({ email: ' ', phoneNumber: undefined }, ['email', 'phoneNumber'])
 * // => Invalid([
 * //   { field: 'email', errors: ['Fill in at least one of: Email, Phone number'] },
 * //   { field: 'phoneNumber', errors: ['Fill in at least one of: Email, Phone number'] },
 * // ])
 *
 * R.pipe({ file: undefined, link: 'https://example.com/a.pdf' }, validateAtLeastOne(['file', 'link']))
 * // => Valid({ file: undefined, link: 'https://example.com/a.pdf' })
 * ```
 *
 * @tags either, or, alternative, one of, contact, cross-field, form, required
 * @see validateRequiredFields - every field required
 * @see validateAllOrNone - fields that must be filled together
 */
export function validateAtLeastOne<T extends object>(
  record: T,
  keys: readonly (keyof T & string)[],
): Validation<T, FieldError<string>>
export function validateAtLeastOne<T extends object>(
  keys: readonly (keyof T & string)[],
): (record: T) => Validation<T, FieldError<string>>
export function validateAtLeastOne(...args: unknown[]): unknown {
  return R.purry(validateAtLeastOneImplementation, args)
}

const validateAtLeastOneImplementation = <T extends object>(
  record: T,
  keys: readonly (keyof T & string)[],
): Validation<T, FieldError<string>> => {
  const message = `Fill in at least one of: ${R.join(R.map(keys, labelOf), ', ')}`
  return keys.some((key) => isFilled(record[key]))
    ? valid(record)
    : invalid(R.map(keys, (key): FieldError<string> => ({ field: key, errors: [message] })))
}
