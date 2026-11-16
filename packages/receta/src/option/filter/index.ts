import * as R from 'remeda'
import type { Option } from '../types'
import { isSome } from '../guards'
import { none } from '../constructors'

/**
 * Filters an Option based on a predicate.
 *
 * If the Option is Some and the predicate returns true, returns the Option unchanged.
 * If the Option is Some and the predicate returns false, returns None.
 * If the Option is None, returns None unchanged.
 *
 * @param option - The Option to filter
 * @param predicate - Function to test the value
 * @returns The filtered Option
 *
 * A type guard narrows the Option: filtering an `Option<string | number>` with `isString`
 * gives an `Option<string>`.
 *
 * @example
 * ```typescript
 * // Data-first
 * filter(some(5), gt(0)) // => Some(5)
 * filter(some(-5), gt(0)) // => None
 * filter(none(), gt(0)) // => None
 *
 * // Data-last (in pipe)
 * pipe(
 *   fromNullable(user.age),
 *   filter(gte(18)),
 *   map(age => `Adult: ${age}`)
 * )
 *
 * // A type guard narrows the type
 * const id: Option<string | number> = some('u_1')
 * filter(id, isString) // => Some('u_1'), typed Option<string>
 * ```
 *
 * @see map - for transforming values
 * @see flatMap - for chaining operations
 */
export function filter<T, U extends T>(
  option: Option<T>,
  predicate: (value: T) => value is U
): Option<U>
export function filter<T>(option: Option<T>, predicate: (value: T) => boolean): Option<T>
export function filter<T, U extends T>(
  predicate: (value: T) => value is U
): (option: Option<T>) => Option<U>
export function filter<T>(predicate: (value: T) => boolean): (option: Option<T>) => Option<T>
export function filter(...args: unknown[]): unknown {
  return R.purry(filterImplementation, args)
}

function filterImplementation<T>(option: Option<T>, predicate: (value: T) => boolean): Option<T> {
  return isSome(option) && predicate(option.value) ? option : none()
}
