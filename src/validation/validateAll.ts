/**
 * Validates an array of values with a single validator.
 *
 * @module validation/validateAll
 */

import * as R from 'remeda'
import type { Validation, Validator } from './types'
import { collectErrors } from './collectErrors'

/**
 * Applies a validator to each element in an array, accumulating all errors.
 *
 * If all elements are valid, returns Valid with the array of values.
 * If any element is invalid, returns Invalid with all accumulated errors.
 *
 * This is useful for bulk validation operations like CSV imports or
 * batch API requests.
 *
 * @param values - Array of values to validate
 * @param validator - Validator to apply to each value
 * @returns Validation with array of values, or all accumulated errors
 *
 * @example
 * ```typescript
 * // Validate array of numbers
 * const isPositive: Validator<number, number, string> =
 *   (n) => n > 0 ? valid(n) : invalid(`${n} is not positive`)
 *
 * validateAll([1, 2, 3], isPositive)
 * // => Valid([1, 2, 3])
 *
 * validateAll([1, -2, 3, -4], isPositive)
 * // => Invalid(['-2 is not positive', '-4 is not positive'])
 *
 * // Real-world: Validate CSV import rows
 * const validateRow = (row: unknown): Validation<User, string> =>
 *   // ... validation logic
 *
 * const validateCSV = (rows: unknown[]) =>
 *   validateAll(rows, validateRow)
 * // Returns all invalid rows with their errors
 *
 * // Real-world: Validate batch API request
 * interface CreateUserRequest {
 *   email: string
 *   name: string
 * }
 *
 * const validateCreateUser = (req: unknown): Validation<CreateUserRequest, string> =>
 *   // ... validation logic
 *
 * const validateBatchCreate = (requests: unknown[]) =>
 *   validateAll(requests, validateCreateUser)
 *
 * // Get detailed error report for failed validations
 * const result = validateBatchCreate(userRequests)
 * if (isInvalid(result)) {
 *   result.errors.forEach((error, idx) => {
 *     console.error(`Request ${idx}: ${error}`)
 *   })
 * }
 * ```
 *
 * @see validate - for applying multiple validators to a single value
 * @see collectErrors - for combining independent validations
 */
export function validateAll<T, U, E>(
  values: readonly T[],
  validator: Validator<T, U, E>
): Validation<U[], E>
export function validateAll<T, U, E>(
  validator: Validator<T, U, E>
): (values: readonly T[]) => Validation<U[], E>
export function validateAll(...args: unknown[]): unknown {
  return R.purry(validateAllImplementation, args)
}

function validateAllImplementation<T, U, E>(
  values: readonly T[],
  validator: Validator<T, U, E>
): Validation<U[], E> {
  return collectErrors(values.map(validator))
}
