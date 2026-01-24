import * as R from 'remeda'
import type { Result } from '../types'
import { isOk } from '../guards'
import { ok } from '../constructors'

/**
 * Maps over the Ok value of a Result.
 *
 * If the Result is Ok, applies the function to its value and returns a new Ok.
 * If the Result is Err, returns the Err unchanged.
 *
 * This is the functor map operation for Result.
 *
 * @param result - The Result to map over
 * @param fn - Function to transform the Ok value
 * @returns A new Result with the transformed value
 *
 * @example
 * ```typescript
 * // Data-first
 * map(ok(5), x => x * 2) // => Ok(10)
 * map(err('fail'), x => x * 2) // => Err('fail')
 *
 * // Data-last (in pipe)
 * pipe(
 *   ok(5),
 *   map(x => x * 2),
 *   map(x => x + 1)
 * ) // => Ok(11)
 * ```
 *
 * @see mapErr - for transforming the error value
 * @see flatMap - for chaining Results
 */
export function map<T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E>
export function map<T, U>(fn: (value: T) => U): <E>(result: Result<T, E>) => Result<U, E>
export function map(...args: unknown[]): unknown {
  return R.purry(mapImplementation, args)
}

function mapImplementation<T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> {
  return isOk(result) ? ok(fn(result.value)) : result
}
