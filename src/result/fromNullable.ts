import * as R from 'remeda'
import type { Result } from './types'
import { ok, err } from './constructors'

/**
 * Converts a nullable value to a Result.
 *
 * If the value is not null or undefined, returns Ok with the value.
 * Otherwise, returns Err with the provided error.
 *
 * @param value - The nullable value
 * @param error - Error to use if value is null/undefined
 * @returns Result containing the value or error
 *
 * @example
 * ```typescript
 * // Data-first
 * fromNullable(42, 'No value') // => Ok(42)
 * fromNullable(null, 'No value') // => Err('No value')
 * fromNullable(undefined, 'No value') // => Err('No value')
 *
 * // Data-last (in pipe)
 * pipe(
 *   users.find(u => u.id === id),
 *   fromNullable('User not found'),
 *   map(user => user.name)
 * )
 *
 * // With error function
 * pipe(
 *   config.get('apiKey'),
 *   fromNullable('Missing API key in config')
 * )
 * ```
 */
export function fromNullable<T, E>(value: T | null | undefined, error: E): Result<T, E>
export function fromNullable<E>(error: E): <T>(value: T | null | undefined) => Result<T, E>
export function fromNullable(...args: unknown[]): unknown {
  return R.purry(fromNullableImplementation, args)
}

function fromNullableImplementation<T, E>(value: T | null | undefined, error: E): Result<T, E> {
  return value == null ? err(error) : ok(value)
}
