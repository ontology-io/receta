import { instrumentedPurry } from '../../utils'
import type { Option } from '../types'
import { isSome } from '../guards'

/**
 * Performs a side effect on Some value without modifying the Option.
 *
 * If the Option is Some, calls the function with the value.
 * Returns the original Option unchanged.
 *
 * Useful for logging, debugging, or other side effects.
 *
 * @param option - The Option to tap
 * @param fn - Side effect function
 * @returns The original Option
 *
 * @example
 * ```typescript
 * // Data-first
 * tap(some(42), x => console.log('Value:', x))
 * // Logs: "Value: 42"
 * // => Some(42)
 *
 * // Data-last (in pipe)
 * pipe(
 *   findUser(id),
 *   tap(user => console.log('Found user:', user.name)),
 *   map(user => user.email)
 * )
 * ```
 *
 * @see tapNone - for side effects on None
 * @see map - for transforming values
 */
export function tap<T>(option: Option<T>, fn: (value: T) => void): Option<T>
export function tap<T>(fn: (value: T) => void): (option: Option<T>) => Option<T>
export function tap(...args: unknown[]): unknown {
  return instrumentedPurry('tap', 'option', tapImplementation, args)
}

function tapImplementation<T>(option: Option<T>, fn: (value: T) => void): Option<T> {
  if (isSome(option)) {
    fn(option.value)
  }
  return option
}

/**
 * Performs a side effect when the Option is None.
 *
 * If the Option is None, calls the function.
 * Returns the original Option unchanged.
 *
 * Useful for logging missing values or debugging.
 *
 * @param option - The Option to tap
 * @param fn - Side effect function
 * @returns The original Option
 *
 * @example
 * ```typescript
 * // Data-first
 * tapNone(none(), () => console.log('No value'))
 * // Logs: "No value"
 * // => None
 *
 * // Data-last (in pipe)
 * pipe(
 *   findUser(id),
 *   tapNone(() => console.log('User not found')),
 *   unwrapOr(guestUser)
 * )
 * ```
 *
 * @see tap - for side effects on Some
 */
export function tapNone<T>(option: Option<T>, fn: () => void): Option<T>
export function tapNone<T>(fn: () => void): (option: Option<T>) => Option<T>
export function tapNone(...args: unknown[]): unknown {
  return instrumentedPurry('tapNone', 'option', tapNoneImplementation, args)
}

function tapNoneImplementation<T>(option: Option<T>, fn: () => void): Option<T> {
  if (!isSome(option)) {
    fn()
  }
  return option
}
