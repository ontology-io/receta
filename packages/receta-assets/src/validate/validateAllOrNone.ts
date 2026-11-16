import * as R from 'remeda'
import { isEmpty, isNullish, not, or } from '@ontologyio/receta/predicate'
import { capitalize, isBlank, snakeCase, words } from '@ontologyio/receta/string'
import { invalid, valid, type FieldError, type Validation } from '@ontologyio/receta/validation'

/** `expiryMonth` and `expiry_month` both read as `Expiry month`. */
const labelOf = (key: string): string => capitalize(R.join(words(snakeCase(key)), ' '))

const isBlankText = (value: unknown): boolean => R.isString(value) && isBlank(value)
const isEmptyList = (value: unknown): boolean => R.isArray(value) && isEmpty(value)
const isMissing = or<unknown>(isNullish, isBlankText, isEmptyList)

/**
 * Checks a group of fields that only make sense together: all filled in, or all left empty.
 *
 * Use when: an optional section of a form has parts that need each other, such as a card's
 * number, expiry and CVC, a date and a time, or a billing address that may be left out. When
 * some are filled and some aren't, each empty one gets a message naming the first filled
 * field. `null`, `undefined`, a blank string and an empty array count as empty.
 *
 * @example
 * ```ts
 * validateAllOrNone({ cardNumber: '', expiry: '', securityCode: '' }, ['cardNumber', 'expiry', 'securityCode'])
 * // => Valid({ cardNumber: '', expiry: '', securityCode: '' })
 *
 * validateAllOrNone({ cardNumber: '4242424242424242', expiry: '', securityCode: ' ' }, ['cardNumber', 'expiry', 'securityCode'])
 * // => Invalid([
 * //   { field: 'expiry', errors: ['Expiry is needed with Card number'] },
 * //   { field: 'securityCode', errors: ['Security code is needed with Card number'] },
 * // ])
 *
 * R.pipe({ date: '2026-03-01', time: '09:30' }, validateAllOrNone(['date', 'time']))
 * // => Valid({ date: '2026-03-01', time: '09:30' })
 * ```
 *
 * @tags together, group, all or none, dependent, cross-field, optional, section, form
 * @see validateAtLeastOne - one of several fields is enough
 * @see validateRequiredFields - every field required
 */
export function validateAllOrNone<T extends object>(
  record: T,
  keys: readonly (keyof T & string)[],
): Validation<T, FieldError<string>>
export function validateAllOrNone<T extends object>(
  keys: readonly (keyof T & string)[],
): (record: T) => Validation<T, FieldError<string>>
export function validateAllOrNone(...args: unknown[]): unknown {
  return R.purry(validateAllOrNoneImplementation, args)
}

const validateAllOrNoneImplementation = <T extends object>(
  record: T,
  keys: readonly (keyof T & string)[],
): Validation<T, FieldError<string>> => {
  const [empty, filled] = R.partition(keys, (key) => isMissing(record[key]))
  const [firstFilled] = filled
  // All empty or all filled is fine; a mix is not.
  if (firstFilled === undefined || R.isEmpty(empty)) return valid(record)
  return invalid(
    R.map(empty, (key): FieldError<string> => ({ field: key, errors: [`${labelOf(key)} is needed with ${labelOf(firstFilled)}`] })),
  )
}
