/**
 * Maps over the Valid value of a Validation.
 *
 * @module validation/map
 */

import * as R from 'remeda'
import type { Validation } from '../types'
import { isValid } from '../guards'
import { valid } from '../constructors'

/**
 * Maps over the Valid value of a Validation.
 *
 * If the validation is Valid, applies the function to the value.
 * If the validation is Invalid, returns it unchanged.
 *
 * @param validation - The validation to map over
 * @param fn - Function to transform the valid value
 * @returns A new validation with the transformed value
 *
 * @example
 * ```typescript
 * // Data-first
 * map(valid(5), x => x * 2) // => Valid(10)
 * map(invalid(['error']), x => x * 2) // => Invalid(['error'])
 *
 * // Data-last (in pipe)
 * pipe(
 *   valid(5),
 *   map(x => x * 2)
 * ) // => Valid(10)
 *
 * // Real-world: Transform validated data
 * const validateAndFormat = (email: string) =>
 *   pipe(
 *     validateEmail(email),
 *     map(e => e.toLowerCase().trim())
 *   )
 * ```
 *
 * @see mapInvalid - for transforming errors
 * @see flatMap - for chaining validations
 */
export function map<T, U, E>(validation: Validation<T, E>, fn: (value: T) => U): Validation<U, E>
export function map<T, U>(fn: (value: T) => U): <E>(validation: Validation<T, E>) => Validation<U, E>
export function map(...args: unknown[]): unknown {
  return R.purry(mapImplementation, args)
}

function mapImplementation<T, U, E>(validation: Validation<T, E>, fn: (value: T) => U): Validation<U, E> {
  return isValid(validation) ? valid(fn(validation.value)) : validation
}
