import { Option, fromNullable } from 'receta/option'
import * as R from 'remeda'
import type { Option } from '../types'
import { isSome } from '../guards'

/**
 * Converts an Option to a nullable value.
 *
 * If the Option is Some, returns the value.
 * If the Option is None, returns null.
 *
 * Use this when interfacing with APIs that expect null for missing values.
 *
 * @param option - The Option to convert
 * @returns The value or null
 *
 * @example
 * ```typescript
 * // Data-first
 * toNullable(some(42)) // => 42
 * toNullable(none()) // => null
 *
 * // Data-last (in pipe)
 * pipe(
 *   findUser(id),
 *   map(u => u.name),
 *   toNullable
 * ) // => 'John' or null
 *
 * // Interfacing with external API
 * const apiPayload = {
 *   userId: pipe(maybeUserId, toNullable),
 *   metadata: pipe(maybeMetadata, toNullable)
 * }
 * ```
 *
 * @see fromNullable - for converting nullable values to Option
 */
export function toNullable<T>(option: Option<T>): T | null
export function toNullable<T>(): (option: Option<T>) => T | null
export function toNullable(...args: unknown[]): unknown {
  return R.purry(toNullableImplementation, args)
}

function toNullableImplementation<T>(option: Option<T>): Option<T> {
  return isSome(option) ? option.value : null
}
