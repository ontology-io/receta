import { instrumentedPurry } from '../../utils'
import type { Result } from '../types'
import { isOk } from '../guards'

/**
 * Flattens a nested Result one level.
 *
 * Converts Result<Result<T, E>, E> to Result<T, E>.
 *
 * @param result - A Result containing another Result
 * @returns The inner Result
 *
 * @example
 * ```typescript
 * // Data-first
 * flatten(ok(ok(42))) // => Ok(42)
 * flatten(ok(err('inner'))) // => Err('inner')
 * flatten(err('outer')) // => Err('outer')
 *
 * // Data-last (in pipe)
 * pipe(
 *   ok(ok(42)),
 *   flatten
 * ) // => Ok(42)
 * ```
 *
 * @see flatMap - for chaining Result-returning functions
 */
export function flatten<T, E, F>(result: Result<Result<T, E>, F>): Result<T, E | F>
export function flatten<T, E>(): <F>(result: Result<Result<T, E>, F>) => Result<T, E | F>
export function flatten(...args: unknown[]): unknown {
  return instrumentedPurry('flatten', 'result', flattenImplementation, args)
}

function flattenImplementation<T, E, F>(result: Result<Result<T, E>, F>): Result<T, E | F> {
  return isOk(result) ? result.value : result
}
