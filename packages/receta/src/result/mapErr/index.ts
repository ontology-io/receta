import * as R from 'remeda'
import type { Result } from '../types'
import { isErr } from '../guards'
import { err } from '../constructors'

/**
 * Maps over the Err value of a Result.
 *
 * If the Result is Err, applies the function to its error and returns a new Err.
 * If the Result is Ok, returns the Ok unchanged.
 *
 * Useful for transforming or enriching error values.
 *
 * @param result - The Result to map over
 * @param fn - Function to transform the Err value
 * @returns A new Result with the transformed error
 *
 * @example
 * ```typescript
 * // Data-first
 * mapErr(err('fail'), e => `Error: ${e}`) // => Err('Error: fail')
 * mapErr(ok(5), e => `Error: ${e}`) // => Ok(5)
 *
 * // Data-last (in pipe)
 * pipe(
 *   parseJSON(str),
 *   mapErr(e => ({
 *     code: 'PARSE_ERROR',
 *     message: e.message,
 *     timestamp: Date.now()
 *   }))
 * )
 * ```
 *
 * @see map - for transforming the success value
 */
export function mapErr<T, E, F>(result: Result<T, E>, fn: (error: E) => F): Result<T, F>
export function mapErr<E, F>(fn: (error: E) => F): <T>(result: Result<T, E>) => Result<T, F>
export function mapErr(...args: unknown[]): unknown {
  return R.purry(mapErrImplementation, args)
}

function mapErrImplementation<T, E, F>(result: Result<T, E>, fn: (error: E) => F): Result<T, F> {
  return isErr(result) ? err(fn(result.error)) : result
}
