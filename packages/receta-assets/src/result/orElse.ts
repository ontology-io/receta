import * as R from 'remeda'
import { match, ok, type Result } from '@ontologyio/receta/result'

/**
 * Replaces an Err with the Result of a fallback that receives the error; an Ok passes through untouched.
 *
 * Use when: a failure has a second way to succeed that depends on what went wrong, such as
 * reading a backup file when the main one is missing, using a cached copy after a timeout,
 * or retrying with different settings. The fallback runs only on `Err` and may fail too,
 * with its own error type. To recover with a plain value, return `ok(value)`.
 *
 * @example
 * ```ts
 * import { err, ok } from '@ontologyio/receta/result'
 *
 * orElse(err('not in cache'), () => ok('from database'))
 * // => Ok('from database')
 *
 * orElse(ok('from cache'), () => ok('from database'))
 * // => Ok('from cache')
 *
 * R.pipe(err({ code: 'TIMEOUT' }), orElse((error) => err(`gave up after ${error.code}`)))
 * // => Err('gave up after TIMEOUT')
 * ```
 *
 * @tags fallback, recover, or else, alternative, backup, catch, default
 * @see recoverWhen - recovers only from the error codes you list
 * @see firstOk - several fallbacks in a row
 * @see match - @ontologyio/receta/result, the branch underneath
 */
export function orElse<T, E, U, F>(
  result: Result<T, E>,
  fallback: (error: E) => Result<U, F>,
): Result<T | U, F>
export function orElse<E, U, F>(
  fallback: (error: E) => Result<U, F>,
): <T>(result: Result<T, E>) => Result<T | U, F>
export function orElse(...args: unknown[]): unknown {
  return R.purry(orElseImplementation, args)
}

const orElseImplementation = <T, E, U, F>(
  result: Result<T, E>,
  fallback: (error: E) => Result<U, F>,
): Result<T | U, F> =>
  match(result, {
    onOk: (value): Result<T | U, F> => ok(value),
    onErr: fallback,
  })
