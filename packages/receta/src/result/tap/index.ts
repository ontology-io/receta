import { instrumentedPurry } from '../../utils'
import type { Result } from '../types'
import { isOk, isErr } from '../guards'

/**
 * Performs a side effect with the Ok value without modifying the Result.
 *
 * Useful for logging, debugging, or performing side effects in a pipeline
 * while keeping the Result unchanged.
 *
 * @param result - The Result to tap into
 * @param fn - Side effect function to call with the Ok value
 * @returns The original Result unchanged
 *
 * @example
 * ```typescript
 * // Data-first
 * tap(ok(42), n => console.log('Got:', n)) // logs 'Got: 42', returns Ok(42)
 * tap(err('fail'), n => console.log(n)) // no log, returns Err('fail')
 *
 * // Data-last (in pipe) - debugging
 * pipe(
 *   fetchUser(id),
 *   tap(user => console.log('Fetched user:', user.name)),
 *   map(user => user.email),
 *   tap(email => console.log('Email:', email))
 * )
 * ```
 *
 * @see tapErr - for side effects with Err values
 */
export function tap<T, E>(result: Result<T, E>, fn: (value: T) => void): Result<T, E>
export function tap<T>(fn: (value: T) => void): <E>(result: Result<T, E>) => Result<T, E>
export function tap(...args: unknown[]): unknown {
  return instrumentedPurry('tap', 'result', tapImplementation, args)
}

function tapImplementation<T, E>(result: Result<T, E>, fn: (value: T) => void): Result<T, E> {
  if (isOk(result)) {
    fn(result.value)
  }
  return result
}

/**
 * Performs a side effect with the Err value without modifying the Result.
 *
 * Useful for error logging or monitoring while keeping the error flowing
 * through the pipeline.
 *
 * @param result - The Result to tap into
 * @param fn - Side effect function to call with the Err value
 * @returns The original Result unchanged
 *
 * @example
 * ```typescript
 * // Data-first
 * tapErr(ok(42), e => console.error(e)) // no log, returns Ok(42)
 * tapErr(err('fail'), e => console.error('Error:', e)) // logs, returns Err('fail')
 *
 * // Data-last (in pipe) - error monitoring
 * pipe(
 *   parseConfig(str),
 *   tapErr(error => {
 *     logError(error)
 *     sendToMonitoring(error)
 *   }),
 *   mapErr(error => 'Using default config due to error'),
 *   unwrapOr(defaultConfig)
 * )
 * ```
 *
 * @see tap - for side effects with Ok values
 */
export function tapErr<T, E>(result: Result<T, E>, fn: (error: E) => void): Result<T, E>
export function tapErr<E>(fn: (error: E) => void): <T>(result: Result<T, E>) => Result<T, E>
export function tapErr(...args: unknown[]): unknown {
  return instrumentedPurry('tapErr', 'result', tapErrImplementation, args)
}

function tapErrImplementation<T, E>(result: Result<T, E>, fn: (error: E) => void): Result<T, E> {
  if (isErr(result)) {
    fn(result.error)
  }
  return result
}
