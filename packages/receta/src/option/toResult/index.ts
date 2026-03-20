import { instrumentedPurry } from '../../utils'
import type { Option } from '../types'
import type { Result } from '../../result/types'
import { ok, err } from '../../result/constructors'
import { isSome } from '../guards'

/**
 * Converts an Option to a Result.
 *
 * If the Option is Some, returns Ok with the value.
 * If the Option is None, returns Err with the provided error.
 *
 * @param option - The Option to convert
 * @param error - Error value to use if None
 * @returns Result containing the value or error
 *
 * @example
 * ```typescript
 * // Data-first
 * toResult(some(42), 'No value') // => Ok(42)
 * toResult(none(), 'No value') // => Err('No value')
 *
 * // Data-last (in pipe)
 * pipe(
 *   findUser(id),
 *   toResult({ code: 'USER_NOT_FOUND', message: 'User not found' }),
 *   flatMap(user => validateUser(user))
 * )
 *
 * // With error function
 * pipe(
 *   config.get('apiKey'),
 *   toResult('Missing API key in config')
 * )
 * ```
 *
 * @see fromResult - for converting Result to Option
 */
export function toResult<T, E>(option: Option<T>, error: E): Result<T, E>
export function toResult<E>(error: E): <T>(option: Option<T>) => Result<T, E>
export function toResult(...args: unknown[]): unknown {
  return instrumentedPurry('toResult', 'option', toResultImplementation, args)
}

function toResultImplementation<T, E>(option: Option<T>, error: E): Result<T, E> {
  return isSome(option) ? ok(option.value) : err(error)
}
