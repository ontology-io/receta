/**
 * Converts Validation to Result.
 *
 * @module validation/toResult
 */

import { instrumentedPurry } from '../../utils'
import type { Validation } from '../types'
import type { Result } from '../../result/types'
import { ok, err } from '../../result/constructors'
import { isValid } from '../guards'

/**
 * Converts a Validation to a Result.
 *
 * Valid becomes Ok, Invalid becomes Err with the array of errors.
 *
 * ⚠️ **Note**: This loses the error accumulation capability of Validation.
 * Result only holds a single error value (which will be the array of all errors).
 *
 * @param validation - The Validation to convert
 * @returns A Result with the value or errors array
 *
 * @example
 * ```typescript
 * // Data-first
 * toResult(valid(42))
 * // => Ok(42)
 *
 * toResult(invalid(['error1', 'error2']))
 * // => Err(['error1', 'error2'])
 *
 * // Data-last (in pipe)
 * pipe(
 *   validateEmail(email),
 *   toResult
 * )
 *
 * // Real-world: Convert to Result for API that expects Result
 * const validateForAPI = (data: unknown) =>
 *   pipe(
 *     validateData(data),
 *     toResult,
 *     Result.mapErr((errors) => ({
 *       code: 'VALIDATION_ERROR',
 *       messages: errors
 *     }))
 *   )
 *
 * // Real-world: Use Result's error handling
 * const process = (input: unknown) =>
 *   pipe(
 *     validateInput(input),
 *     toResult,
 *     Result.flatMap(processValidData),
 *     Result.unwrapOr(defaultValue)
 *   )
 * ```
 *
 * @see fromResult - for converting Result to Validation
 */
export function toResult<T, E>(validation: Validation<T, E>): Result<T, readonly E[]>
export function toResult<T, E>(): (validation: Validation<T, E>) => Result<T, readonly E[]>
export function toResult(...args: unknown[]): unknown {
  return instrumentedPurry('toResult', 'validation', toResultImplementation, args)
}

function toResultImplementation<T, E>(validation: Validation<T, E>): Result<T, readonly E[]> {
  return isValid(validation) ? ok(validation.value) : err(validation.errors)
}

/**
 * Converts a Validation to a Result, combining all errors into a single error.
 *
 * Like toResult, but uses a function to combine multiple errors into a single error.
 * This is useful when you need a Result with a single error value instead of an array.
 *
 * @param validation - The Validation to convert
 * @param combineErrors - Function to combine errors array into single error
 * @returns A Result with the value or combined error
 *
 * @example
 * ```typescript
 * // Combine errors into a message
 * toResultWith(
 *   invalid(['Error 1', 'Error 2', 'Error 3']),
 *   (errors) => errors.join('; ')
 * )
 * // => Err('Error 1; Error 2; Error 3')
 *
 * // Use first error only
 * toResultWith(
 *   invalid(['Error 1', 'Error 2']),
 *   (errors) => errors[0] ?? 'Unknown error'
 * )
 * // => Err('Error 1')
 *
 * // Real-world: Create structured error
 * const toApiResult = (validation: Validation<User, string>) =>
 *   toResultWith(validation, (errors) => ({
 *     status: 400,
 *     code: 'VALIDATION_ERROR',
 *     message: 'Validation failed',
 *     details: errors
 *   }))
 *
 * // Real-world: Format for display
 * const toDisplayResult = (validation: Validation<Data, FieldError>) =>
 *   toResultWith(validation, (errors) => ({
 *     title: 'Please fix the following errors:',
 *     items: errors.map(e => `${e.field}: ${e.errors.join(', ')}`)
 *   }))
 * ```
 *
 * @see toResult - for keeping errors as array
 * @see fromResult - for converting Result to Validation
 */
export function toResultWith<T, E, F>(
  validation: Validation<T, E>,
  combineErrors: (errors: readonly E[]) => F
): Result<T, F>
export function toResultWith<E, F>(
  combineErrors: (errors: readonly E[]) => F
): <T>(validation: Validation<T, E>) => Result<T, F>
export function toResultWith(...args: unknown[]): unknown {
  return instrumentedPurry('toResultWith', 'validation', toResultWithImplementation, args)
}

function toResultWithImplementation<T, E, F>(
  validation: Validation<T, E>,
  combineErrors: (errors: readonly E[]) => F
): Result<T, F> {
  return isValid(validation) ? ok(validation.value) : err(combineErrors(validation.errors))
}
