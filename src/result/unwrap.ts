import * as R from 'remeda'
import type { Result } from './types'
import { isOk } from './guards'

/**
 * Extracts the value from an Ok Result or throws the error.
 *
 * **Warning**: This function throws if the Result is Err.
 * Use `unwrapOr` or `unwrapOrElse` for safer alternatives.
 *
 * @param result - The Result to unwrap
 * @returns The value from Ok
 * @throws The error if Result is Err
 *
 * @example
 * ```typescript
 * unwrap(ok(42)) // => 42
 * unwrap(err('fail')) // throws 'fail'
 * ```
 *
 * @see unwrapOr - for providing a default value
 * @see unwrapOrElse - for computing a fallback value
 */
export function unwrap<T, E>(result: Result<T, E>): T {
  if (isOk(result)) {
    return result.value
  }
  throw result.error
}

/**
 * Extracts the value from an Ok Result or returns a default.
 *
 * @param result - The Result to unwrap
 * @param defaultValue - Value to return if Result is Err
 * @returns The value from Ok or the default
 *
 * @example
 * ```typescript
 * // Data-first
 * unwrapOr(ok(42), 0) // => 42
 * unwrapOr(err('fail'), 0) // => 0
 *
 * // Data-last (in pipe)
 * pipe(
 *   parseNumber('abc'),
 *   unwrapOr(0)
 * ) // => 0
 * ```
 *
 * @see unwrapOrElse - for lazy default computation
 */
export function unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T
export function unwrapOr<T>(defaultValue: T): <E>(result: Result<T, E>) => T
export function unwrapOr(...args: unknown[]): unknown {
  return R.purry(unwrapOrImplementation, args)
}

function unwrapOrImplementation<T, E>(result: Result<T, E>, defaultValue: T): T {
  return isOk(result) ? result.value : defaultValue
}

/**
 * Extracts the value from an Ok Result or computes a fallback from the error.
 *
 * Unlike `unwrapOr`, this allows you to compute the default value lazily
 * and access the error for decision-making.
 *
 * @param result - The Result to unwrap
 * @param fn - Function to compute fallback from error
 * @returns The value from Ok or the computed fallback
 *
 * @example
 * ```typescript
 * // Data-first
 * unwrapOrElse(ok(42), () => 0) // => 42
 * unwrapOrElse(err('fail'), e => {
 *   console.error(e)
 *   return 0
 * }) // logs 'fail', returns 0
 *
 * // Data-last (in pipe)
 * pipe(
 *   fetchUser(id),
 *   unwrapOrElse(error => {
 *     logError(error)
 *     return guestUser
 *   })
 * )
 * ```
 *
 * @see unwrapOr - for static default values
 */
export function unwrapOrElse<T, E>(result: Result<T, E>, fn: (error: E) => T): T
export function unwrapOrElse<T, E>(fn: (error: E) => T): (result: Result<T, E>) => T
export function unwrapOrElse(...args: unknown[]): unknown {
  return R.purry(unwrapOrElseImplementation, args)
}

function unwrapOrElseImplementation<T, E>(result: Result<T, E>, fn: (error: E) => T): T {
  return isOk(result) ? result.value : fn(result.error)
}
