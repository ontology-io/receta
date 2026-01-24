import * as R from 'remeda'
import type { Option } from '../types'
import { isSome } from '../guards'

/**
 * Extracts the value from a Some Option or throws an error.
 *
 * If the Option is Some, returns the value.
 * If the Option is None, throws an error.
 *
 * Use this when you're certain the value exists. Prefer unwrapOr or unwrapOrElse
 * for safer alternatives.
 *
 * @param option - The Option to unwrap
 * @returns The value if Some
 * @throws Error if None
 *
 * @example
 * ```typescript
 * unwrap(some(42)) // => 42
 * unwrap(none()) // throws Error: Cannot unwrap None
 * ```
 *
 * @see unwrapOr - for providing a default value
 * @see unwrapOrElse - for computing a default value
 */
export function unwrap<T>(option: Option<T>): T {
  if (isSome(option)) {
    return option.value
  }
  throw new Error('Cannot unwrap None')
}

/**
 * Extracts the value from an Option or returns a default.
 *
 * If the Option is Some, returns the value.
 * If the Option is None, returns the default value.
 *
 * @param option - The Option to unwrap
 * @param defaultValue - Value to return if None
 * @returns The value or default
 *
 * @example
 * ```typescript
 * // Data-first
 * unwrapOr(some(42), 0) // => 42
 * unwrapOr(none(), 0) // => 0
 *
 * // Data-last (in pipe)
 * pipe(
 *   findUser(id),
 *   map(u => u.name),
 *   unwrapOr('Guest')
 * ) // => 'John' or 'Guest'
 * ```
 *
 * @see unwrapOrElse - for computing the default value lazily
 * @see unwrap - for throwing on None
 */
export function unwrapOr<T>(option: Option<T>, defaultValue: T): T
export function unwrapOr<T>(defaultValue: T): (option: Option<T>) => T
export function unwrapOr(...args: unknown[]): unknown {
  return R.purry(unwrapOrImplementation, args)
}

function unwrapOrImplementation<T>(option: Option<T>, defaultValue: T): T {
  return isSome(option) ? option.value : defaultValue
}

/**
 * Extracts the value from an Option or computes a default.
 *
 * If the Option is Some, returns the value.
 * If the Option is None, calls the function to compute a default.
 *
 * Use this when the default value is expensive to compute.
 *
 * @param option - The Option to unwrap
 * @param fn - Function to compute default value
 * @returns The value or computed default
 *
 * @example
 * ```typescript
 * // Data-first
 * unwrapOrElse(some(42), () => expensiveComputation()) // => 42
 * unwrapOrElse(none(), () => expensiveComputation()) // => computed value
 *
 * // Data-last (in pipe)
 * pipe(
 *   config.get('timeout'),
 *   unwrapOrElse(() => DEFAULT_TIMEOUT)
 * )
 * ```
 *
 * @see unwrapOr - for simple default values
 * @see unwrap - for throwing on None
 */
export function unwrapOrElse<T>(option: Option<T>, fn: () => T): T
export function unwrapOrElse<T>(fn: () => T): (option: Option<T>) => T
export function unwrapOrElse(...args: unknown[]): unknown {
  return R.purry(unwrapOrElseImplementation, args)
}

function unwrapOrElseImplementation<T>(option: Option<T>, fn: () => T): T {
  return isSome(option) ? option.value : fn()
}
