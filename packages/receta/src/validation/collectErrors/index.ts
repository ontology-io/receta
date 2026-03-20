/**
 * Collects validations with error accumulation.
 *
 * @module validation/collectErrors
 */

import { instrumentedPurry } from '../../utils'
import type { Validation } from '../types'
import { valid, invalid } from '../constructors'
import { isInvalid } from '../guards'

/**
 * Collects an array of Validations into a single Validation, accumulating all errors.
 *
 * **This is the key difference from Result.collect**, which short-circuits on the first error.
 * collectErrors continues through all validations and accumulates every error found.
 *
 * If all Validations are Valid, returns Valid with an array of all values.
 * If any Validation is Invalid, returns Invalid with ALL accumulated errors.
 *
 * @param validations - Array of Validations to collect
 * @returns Validation containing array of all values, or all accumulated errors
 *
 * @example
 * ```typescript
 * // All successful
 * collectErrors([valid(1), valid(2), valid(3)])
 * // => Valid([1, 2, 3])
 *
 * // Accumulates ALL errors (vs Result.collect which stops at first)
 * collectErrors([
 *   invalid(['error1']),
 *   invalid(['error2']),
 *   invalid(['error3'])
 * ])
 * // => Invalid(['error1', 'error2', 'error3'])
 *
 * // Mixed: accumulates all errors, ignores values
 * collectErrors([
 *   valid(1),
 *   invalid(['error1']),
 *   valid(2),
 *   invalid(['error2'])
 * ])
 * // => Invalid(['error1', 'error2'])
 *
 * // Real-world: Validate all form fields and show all errors
 * const validateForm = (data: FormData) =>
 *   collectErrors([
 *     validateName(data.name),
 *     validateEmail(data.email),
 *     validateAge(data.age),
 *     validatePassword(data.password)
 *   ])
 * // Returns all validation errors, not just the first one
 *
 * // Real-world: Bulk validation with full error reporting
 * const validateUsers = (users: unknown[]) =>
 *   collectErrors(users.map(validateUser))
 * // Get all invalid users with their errors
 * ```
 *
 * @see validate - for applying multiple validators to a single value
 * @see validateAll - for validating an array with a single validator
 */
export function collectErrors<T, E>(
  validations: readonly Validation<T, E>[]
): Validation<T[], E>
export function collectErrors<T>(): <E>(
  validations: readonly Validation<T, E>[]
) => Validation<T[], E>
export function collectErrors(...args: unknown[]): unknown {
  return instrumentedPurry('collectErrors', 'validation', collectErrorsImplementation, args)
}

function collectErrorsImplementation<T, E>(
  validations: readonly Validation<T, E>[]
): Validation<T[], E> {
  const errors: E[] = []
  const values: T[] = []

  for (const validation of validations) {
    if (isInvalid(validation)) {
      errors.push(...validation.errors)
    } else {
      values.push(validation.value)
    }
  }

  return errors.length > 0 ? invalid(errors) : valid(values)
}
