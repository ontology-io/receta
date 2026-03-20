/**
 * Applies multiple validators to a single value.
 *
 * @module validation/validate
 */

import { instrumentedPurry } from '../../utils'
import type { Validation, Validator } from '../types'
import { collectErrors } from '../collectErrors'
import { map } from '../map'

/**
 * Applies multiple validators to a single value, accumulating all errors.
 *
 * All validators are run against the value. If any fail, all errors are accumulated.
 * If all succeed, returns Valid with the original value.
 *
 * This is useful when a single value must satisfy multiple independent constraints.
 *
 * @param value - The value to validate
 * @param validators - Array of validators to apply
 * @returns Validation with the value if all pass, or all accumulated errors
 *
 * @example
 * ```typescript
 * // Define validators
 * const minLength = (min: number): Validator<string, string, string> =>
 *   (s) => s.length >= min ? valid(s) : invalid(`Min ${min} chars`)
 *
 * const maxLength = (max: number): Validator<string, string, string> =>
 *   (s) => s.length <= max ? valid(s) : invalid(`Max ${max} chars`)
 *
 * const noSpaces: Validator<string, string, string> =
 *   (s) => /^\S+$/.test(s) ? valid(s) : invalid('No spaces allowed')
 *
 * // Apply all validators
 * validate('hi', [minLength(5), maxLength(10), noSpaces])
 * // => Invalid(['Min 5 chars'])
 *
 * validate('hello world', [minLength(5), maxLength(10), noSpaces])
 * // => Invalid(['No spaces allowed'])
 *
 * validate('hello', [minLength(5), maxLength(10), noSpaces])
 * // => Valid('hello')
 *
 * // Real-world: Password validation with multiple rules
 * const validatePassword = (password: string) =>
 *   validate(password, [
 *     fromPredicate(s => s.length >= 8, 'At least 8 characters'),
 *     fromPredicate(s => /[A-Z]/.test(s), 'At least one uppercase'),
 *     fromPredicate(s => /[0-9]/.test(s), 'At least one number'),
 *     fromPredicate(s => /[^A-Za-z0-9]/.test(s), 'At least one special char')
 *   ])
 *
 * validatePassword('weak')
 * // => Invalid([
 * //   'At least 8 characters',
 * //   'At least one uppercase',
 * //   'At least one number',
 * //   'At least one special char'
 * // ])
 *
 * // Real-world: Email validation with multiple checks
 * const validateEmail = (email: string) =>
 *   validate(email, [
 *     fromPredicate(s => s.length > 0, 'Email required'),
 *     fromPredicate(s => s.includes('@'), 'Must contain @'),
 *     fromPredicate(s => s.length <= 254, 'Email too long'),
 *     fromPredicate(s => !/\s/.test(s), 'No whitespace allowed')
 *   ])
 * ```
 *
 * @see collectErrors - for combining independent validations
 * @see validateAll - for validating an array with a single validator
 */
export function validate<T, E>(
  value: T,
  validators: readonly Validator<T, T, E>[]
): Validation<T, E>
export function validate<T, E>(
  validators: readonly Validator<T, T, E>[]
): (value: T) => Validation<T, E>
export function validate(...args: unknown[]): unknown {
  return instrumentedPurry('validate', 'validation', validateImplementation, args)
}

function validateImplementation<T, E>(
  value: T,
  validators: readonly Validator<T, T, E>[]
): Validation<T, E> {
  const validations = validators.map((validator) => validator(value))
  const collected = collectErrors(validations)
  return map(collected, () => value)
}
