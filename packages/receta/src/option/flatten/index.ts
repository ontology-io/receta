import { instrumentedPurry } from '../../utils'
import type { Option } from '../types'
import { isSome } from '../guards'

/**
 * Flattens a nested Option.
 *
 * Converts Option<Option<T>> to Option<T>.
 *
 * @param option - The nested Option to flatten
 * @returns The flattened Option
 *
 * @example
 * ```typescript
 * // Data-first
 * flatten(some(some(42))) // => Some(42)
 * flatten(some(none())) // => None
 * flatten(none()) // => None
 *
 * // Data-last (in pipe)
 * pipe(
 *   some(some(5)),
 *   flatten,
 *   map(x => x * 2)
 * ) // => Some(10)
 * ```
 *
 * @see flatMap - for mapping and flattening in one step
 */
export function flatten<T>(option: Option<Option<T>>): Option<T>
export function flatten<T>(): (option: Option<Option<T>>) => Option<T>
export function flatten(...args: unknown[]): unknown {
  return instrumentedPurry('flatten', 'option', flattenImplementation, args)
}

function flattenImplementation<T>(option: Option<Option<T>>): Option<T> {
  return isSome(option) ? option.value : option
}
