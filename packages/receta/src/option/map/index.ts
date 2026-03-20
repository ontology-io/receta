import { instrumentedPurry } from '../../utils'
import type { Option } from '../types'
import { isSome } from '../guards'
import { some } from '../constructors'

/**
 * Maps over the Some value of an Option.
 *
 * If the Option is Some, applies the function to its value and returns a new Some.
 * If the Option is None, returns None unchanged.
 *
 * This is the functor map operation for Option.
 *
 * @param option - The Option to map over
 * @param fn - Function to transform the Some value
 * @returns A new Option with the transformed value
 *
 * @example
 * ```typescript
 * // Data-first
 * map(some(5), x => x * 2) // => Some(10)
 * map(none(), x => x * 2) // => None
 *
 * // Data-last (in pipe)
 * pipe(
 *   some(5),
 *   map(x => x * 2),
 *   map(x => x + 1)
 * ) // => Some(11)
 * ```
 *
 * @see flatMap - for chaining Option-returning functions
 * @see filter - for conditionally keeping values
 */
export function map<T, U>(option: Option<T>, fn: (value: T) => U): Option<U>
export function map<T, U>(fn: (value: T) => U): (option: Option<T>) => Option<U>
export function map(...args: unknown[]): unknown {
  return instrumentedPurry('map', 'option', mapImplementation, args)
}

function mapImplementation<T, U>(option: Option<T>, fn: (value: T) => U): Option<U> {
  return isSome(option) ? some(fn(option.value)) : option
}
