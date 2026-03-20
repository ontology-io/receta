import { instrumentedPurry } from '../../utils'
import type { Option } from '../types'
import { isSome } from '../guards'

/**
 * Chains Option-returning functions.
 *
 * If the Option is Some, applies the function to its value.
 * If the Option is None, returns None unchanged.
 *
 * This is the monadic bind operation for Option, used to avoid nested Options.
 *
 * @param option - The Option to flat map over
 * @param fn - Function that returns a new Option
 * @returns The resulting Option
 *
 * @example
 * ```typescript
 * // Data-first
 * const findUser = (id: string): Option<User> => ...
 * const getEmail = (user: User): Option<string> => ...
 *
 * flatMap(findUser('123'), getEmail)
 * // => Some('user@example.com') or None
 *
 * // Data-last (in pipe)
 * pipe(
 *   findUser('123'),
 *   flatMap(getEmail),
 *   flatMap(validateEmail)
 * )
 * ```
 *
 * @see map - for transforming values without nesting
 * @see flatten - for flattening nested Options
 */
export function flatMap<T, U>(option: Option<T>, fn: (value: T) => Option<U>): Option<U>
export function flatMap<T, U>(fn: (value: T) => Option<U>): (option: Option<T>) => Option<U>
export function flatMap(...args: unknown[]): unknown {
  return instrumentedPurry('flatMap', 'option', flatMapImplementation, args)
}

function flatMapImplementation<T, U>(option: Option<T>, fn: (value: T) => Option<U>): Option<U> {
  return isSome(option) ? fn(option.value) : option
}
