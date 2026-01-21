/**
 * Type guards for Validation type checking.
 *
 * @module validation/guards
 */

import type { Validation, Valid, Invalid } from './types'

/**
 * Type guard to check if a Validation is Valid.
 *
 * Narrows the type to Valid<T>, allowing safe access to the value.
 *
 * @param validation - The validation to check
 * @returns True if the validation is Valid
 *
 * @example
 * ```typescript
 * const result = valid(42)
 *
 * if (isValid(result)) {
 *   console.log(result.value) // TypeScript knows this is safe: 42
 * }
 *
 * // Real-world: Conditional logic based on validation
 * const validation = validateEmail(email)
 * if (isValid(validation)) {
 *   await sendEmail(validation.value)
 * } else {
 *   showErrors(validation.errors)
 * }
 * ```
 *
 * @see isInvalid - for checking if validation failed
 */
export function isValid<T, E>(validation: Validation<T, E>): validation is Valid<T> {
  return validation._tag === 'Valid'
}

/**
 * Type guard to check if a Validation is Invalid.
 *
 * Narrows the type to Invalid<E>, allowing safe access to the errors.
 *
 * @param validation - The validation to check
 * @returns True if the validation is Invalid
 *
 * @example
 * ```typescript
 * const result = invalid(['Name required', 'Email invalid'])
 *
 * if (isInvalid(result)) {
 *   console.log(result.errors) // TypeScript knows this is safe
 *   // => ['Name required', 'Email invalid']
 * }
 *
 * // Real-world: Error handling
 * const validation = validateForm(formData)
 * if (isInvalid(validation)) {
 *   validation.errors.forEach(err => displayError(err))
 *   return
 * }
 * processForm(validation.value)
 * ```
 *
 * @see isValid - for checking if validation succeeded
 */
export function isInvalid<T, E>(validation: Validation<T, E>): validation is Invalid<E> {
  return validation._tag === 'Invalid'
}
