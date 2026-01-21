import type { Option, Some, None } from './types'
import type { Result } from '../result/types'
import { isOk } from '../result/guards'

/**
 * Creates a Some Option containing a value.
 *
 * @param value - The value to wrap
 * @returns A Some Option containing the value
 *
 * @example
 * ```typescript
 * const result = some(42)
 * // => { _tag: 'Some', value: 42 }
 * ```
 */
export function some<T>(value: T): Some<T> {
  return { _tag: 'Some', value }
}

/**
 * Creates a None Option representing absence of a value.
 *
 * @returns A None Option
 *
 * @example
 * ```typescript
 * const result = none()
 * // => { _tag: 'None' }
 * ```
 */
export function none<T = never>(): None {
  return { _tag: 'None' }
}

/**
 * Converts a nullable value to an Option.
 *
 * If the value is not null or undefined, returns Some with the value.
 * Otherwise, returns None.
 *
 * @param value - The nullable value
 * @returns Option containing the value or None
 *
 * @example
 * ```typescript
 * fromNullable(42) // => Some(42)
 * fromNullable(null) // => None
 * fromNullable(undefined) // => None
 *
 * // With array find
 * const user = fromNullable(users.find(u => u.id === id))
 * ```
 */
export function fromNullable<T>(value: T | null | undefined): Option<T> {
  return value == null ? none() : some(value)
}

/**
 * Converts a Result to an Option, discarding the error.
 *
 * If the Result is Ok, returns Some with the value.
 * If the Result is Err, returns None.
 *
 * @param result - The Result to convert
 * @returns Option containing the Ok value or None
 *
 * @example
 * ```typescript
 * // When you don't care about the specific error
 * const maybeNumber = fromResult(parseNumber(str))
 * // Ok(42) => Some(42)
 * // Err('Invalid') => None
 * ```
 */
export function fromResult<T, E>(result: Result<T, E>): Option<T> {
  return isOk(result) ? some(result.value) : none()
}

/**
 * Wraps a potentially throwing function in an Option.
 *
 * If the function executes successfully, returns Some with the value.
 * If it throws, returns None.
 *
 * @param fn - Function that may throw
 * @returns Option containing either the return value or None
 *
 * @example
 * ```typescript
 * const parseJSON = (str: string) =>
 *   tryCatch(() => JSON.parse(str))
 *
 * parseJSON('{"name":"John"}')
 * // => Some({ name: 'John' })
 *
 * parseJSON('invalid json')
 * // => None
 * ```
 */
export function tryCatch<T>(fn: () => T): Option<T> {
  try {
    return some(fn())
  } catch {
    return none()
  }
}
