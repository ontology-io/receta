import type { Result, Ok, Err } from './types'

/**
 * Type guard to check if a Result is Ok.
 *
 * Narrows the type to Ok<T>, allowing safe access to the value property.
 *
 * @param result - The Result to check
 * @returns True if the Result is Ok, false otherwise
 *
 * @example
 * ```typescript
 * const result: Result<number, string> = ok(42)
 *
 * if (isOk(result)) {
 *   console.log(result.value) // TypeScript knows this is safe
 * }
 * ```
 */
export function isOk<T, E>(result: Result<T, E>): result is Ok<T> {
  return result._tag === 'Ok'
}

/**
 * Type guard to check if a Result is Err.
 *
 * Narrows the type to Err<E>, allowing safe access to the error property.
 *
 * @param result - The Result to check
 * @returns True if the Result is Err, false otherwise
 *
 * @example
 * ```typescript
 * const result: Result<number, string> = err('Failed')
 *
 * if (isErr(result)) {
 *   console.log(result.error) // TypeScript knows this is safe
 * }
 * ```
 */
export function isErr<T, E>(result: Result<T, E>): result is Err<E> {
  return result._tag === 'Err'
}
