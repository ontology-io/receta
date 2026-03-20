import { instrumentedPurry } from '../../utils'
import type { Result } from '../types'
import { isOk } from '../guards'

/**
 * Chains Result-returning operations (monadic bind).
 *
 * If the Result is Ok, applies the function to its value and returns the resulting Result.
 * If the Result is Err, returns the Err unchanged.
 *
 * Use this when you have a sequence of operations that each return a Result.
 * This prevents nesting Results (Result<Result<T, E>, E>).
 *
 * @param result - The Result to flatMap over
 * @param fn - Function that returns a Result
 * @returns The Result from the function, or the original Err
 *
 * @example
 * ```typescript
 * // Data-first
 * const parseNumber = (str: string): Result<number, string> =>
 *   str === '' ? err('Empty string') : ok(Number(str))
 *
 * flatMap(ok('42'), parseNumber) // => Ok(42)
 * flatMap(ok(''), parseNumber) // => Err('Empty string')
 * flatMap(err('fail'), parseNumber) // => Err('fail')
 *
 * // Data-last (in pipe) - chaining operations
 * pipe(
 *   tryCatch(() => readFile('config.json')),
 *   flatMap(str => tryCatch(() => JSON.parse(str))),
 *   flatMap(config => validateConfig(config)),
 *   map(config => config.port)
 * )
 * ```
 *
 * @see map - for transforming values without nesting
 * @see flatten - for flattening nested Results
 */
export function flatMap<T, U, E, F>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, F>
): Result<U, E | F>
export function flatMap<T, U, F>(
  fn: (value: T) => Result<U, F>
): <E>(result: Result<T, E>) => Result<U, E | F>
export function flatMap(...args: unknown[]): unknown {
  return instrumentedPurry('flatMap', 'result', flatMapImplementation, args)
}

function flatMapImplementation<T, U, E, F>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, F>
): Result<U, E | F> {
  return isOk(result) ? fn(result.value) : result
}
