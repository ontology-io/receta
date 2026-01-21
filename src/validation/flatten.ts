/**
 * Flattens nested Validation structures.
 *
 * @module validation/flatten
 */

import * as R from 'remeda'
import type { Validation } from './types'
import { isValid } from './guards'

/**
 * Flattens a nested Validation<Validation<T, E>, E> to Validation<T, E>.
 *
 * If the outer validation is Valid containing a Valid, returns the inner Valid.
 * If the outer validation is Valid containing an Invalid, returns the inner Invalid.
 * If the outer validation is Invalid, returns it unchanged.
 *
 * @param validation - The nested validation to flatten
 * @returns The flattened validation
 *
 * @example
 * ```typescript
 * // Data-first
 * flatten(valid(valid(5))) // => Valid(5)
 * flatten(valid(invalid(['error']))) // => Invalid(['error'])
 * flatten(invalid(['outer error'])) // => Invalid(['outer error'])
 *
 * // Data-last (in pipe)
 * pipe(
 *   valid(valid(5)),
 *   flatten
 * ) // => Valid(5)
 *
 * // Real-world: Flatten result of mapping with validator
 * const validateEmail = (s: string) =>
 *   s.includes('@') ? valid(s) : invalid('Invalid email')
 *
 * pipe(
 *   valid('user@example.com'),
 *   map(validateEmail),  // => Valid(Valid('user@example.com'))
 *   flatten              // => Valid('user@example.com')
 * )
 *
 * // Note: Usually you'd use flatMap instead
 * pipe(
 *   valid('user@example.com'),
 *   flatMap(validateEmail) // => Valid('user@example.com')
 * )
 * ```
 *
 * @see flatMap - for mapping and flattening in one step
 */
export function flatten<T, E>(validation: Validation<Validation<T, E>, E>): Validation<T, E>
export function flatten<T, E>(): (validation: Validation<Validation<T, E>, E>) => Validation<T, E>
export function flatten(...args: unknown[]): unknown {
  return R.purry(flattenImplementation, args)
}

function flattenImplementation<T, E>(validation: Validation<Validation<T, E>, E>): Validation<T, E> {
  return isValid(validation) ? validation.value : validation
}
