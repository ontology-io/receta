/**
 * Chains validation operations.
 *
 * @module validation/flatMap
 */

import * as R from 'remeda'
import type { Validation } from '../types'
import { isValid } from '../guards'

/**
 * Chains validation operations.
 *
 * If the validation is Valid, applies the function which returns a new Validation.
 * If the validation is Invalid, returns it unchanged.
 *
 * This is the monadic bind operation for Validation, allowing you to sequence
 * dependent validations.
 *
 * @param validation - The validation to chain from
 * @param fn - Function that takes the valid value and returns a new validation
 * @returns The resulting validation from applying the function, or the original Invalid
 *
 * @example
 * ```typescript
 * // Data-first
 * flatMap(valid(5), x => valid(x * 2)) // => Valid(10)
 * flatMap(invalid(['error']), x => valid(x * 2)) // => Invalid(['error'])
 *
 * // Data-last (in pipe)
 * pipe(
 *   valid(5),
 *   flatMap(x => valid(x * 2))
 * ) // => Valid(10)
 *
 * // Real-world: Chain dependent validations
 * const validateAge = (age: number) =>
 *   age >= 18 ? valid(age) : invalid('Must be 18+')
 *
 * const validateAgeRange = (age: number) =>
 *   age <= 120 ? valid(age) : invalid('Invalid age')
 *
 * const validateUserAge = (age: number) =>
 *   pipe(
 *     validateAge(age),
 *     flatMap(validateAgeRange)
 *   )
 *
 * // Parse then validate
 * const parseAndValidate = (str: string) =>
 *   pipe(
 *     tryCatch(() => JSON.parse(str)),
 *     flatMap(validateUserSchema)
 *   )
 * ```
 *
 * @see map - for transforming values without chaining
 * @see flatten - for flattening nested validations
 */
export function flatMap<T, U, E>(
  validation: Validation<T, E>,
  fn: (value: T) => Validation<U, E>
): Validation<U, E>
export function flatMap<T, U, E>(
  fn: (value: T) => Validation<U, E>
): (validation: Validation<T, E>) => Validation<U, E>
export function flatMap(...args: unknown[]): unknown {
  return R.purry(flatMapImplementation, args)
}

function flatMapImplementation<T, U, E>(
  validation: Validation<T, E>,
  fn: (value: T) => Validation<U, E>
): Validation<U, E> {
  return isValid(validation) ? fn(validation.value) : validation
}
