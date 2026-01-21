/**
 * Maps over the Invalid errors of a Validation.
 *
 * @module validation/mapInvalid
 */

import * as R from 'remeda'
import type { Validation } from './types'
import { isInvalid } from './guards'
import { invalid } from './constructors'

/**
 * Maps over the Invalid errors of a Validation.
 *
 * If the validation is Invalid, applies the function to each error.
 * If the validation is Valid, returns it unchanged.
 *
 * @param validation - The validation to map over
 * @param fn - Function to transform each error
 * @returns A new validation with transformed errors
 *
 * @example
 * ```typescript
 * // Data-first
 * mapInvalid(invalid(['error1', 'error2']), e => e.toUpperCase())
 * // => Invalid(['ERROR1', 'ERROR2'])
 *
 * mapInvalid(valid(42), e => e.toUpperCase())
 * // => Valid(42)
 *
 * // Data-last (in pipe)
 * pipe(
 *   invalid(['error1', 'error2']),
 *   mapInvalid(e => e.toUpperCase())
 * ) // => Invalid(['ERROR1', 'ERROR2'])
 *
 * // Real-world: Add context to errors
 * const validateForm = (data: FormData) =>
 *   pipe(
 *     validateEmail(data.email),
 *     mapInvalid(err => ({ field: 'email', message: err }))
 *   )
 *
 * // Transform error types
 * const toApiError = (err: string): ApiError => ({
 *   code: 'VALIDATION_ERROR',
 *   message: err,
 *   timestamp: Date.now()
 * })
 *
 * pipe(
 *   validateInput(input),
 *   mapInvalid(toApiError)
 * )
 * ```
 *
 * @see map - for transforming valid values
 * @see flatMap - for chaining validations
 */
export function mapInvalid<T, E, F>(
  validation: Validation<T, E>,
  fn: (error: E) => F
): Validation<T, F>
export function mapInvalid<E, F>(
  fn: (error: E) => F
): <T>(validation: Validation<T, E>) => Validation<T, F>
export function mapInvalid(...args: unknown[]): unknown {
  return R.purry(mapInvalidImplementation, args)
}

function mapInvalidImplementation<T, E, F>(
  validation: Validation<T, E>,
  fn: (error: E) => F
): Validation<T, F> {
  return isInvalid(validation) ? invalid(validation.errors.map(fn)) : validation
}
