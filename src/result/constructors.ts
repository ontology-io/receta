import type { Result, Ok, Err } from './types'

/**
 * Creates a successful Result containing a value.
 *
 * @param value - The success value
 * @returns An Ok Result containing the value
 *
 * @example
 * ```typescript
 * const result = ok(42)
 * // => { _tag: 'Ok', value: 42 }
 * ```
 */
export function ok<T>(value: T): Ok<T> {
  return { _tag: 'Ok', value }
}

/**
 * Creates a failed Result containing an error.
 *
 * @param error - The error value
 * @returns An Err Result containing the error
 *
 * @example
 * ```typescript
 * const result = err('Something went wrong')
 * // => { _tag: 'Err', error: 'Something went wrong' }
 * ```
 */
export function err<E>(error: E): Err<E> {
  return { _tag: 'Err', error }
}

/**
 * Wraps a potentially throwing function in a Result.
 *
 * If the function executes successfully, returns Ok with the value.
 * If it throws, returns Err with the error.
 *
 * @param fn - Function that may throw
 * @returns Result containing either the return value or the error
 *
 * @example
 * ```typescript
 * const parseJSON = (str: string) =>
 *   tryCatch(() => JSON.parse(str))
 *
 * parseJSON('{"name":"John"}')
 * // => Ok({ name: 'John' })
 *
 * parseJSON('invalid json')
 * // => Err(SyntaxError: ...)
 * ```
 */
export function tryCatch<T>(fn: () => T): Result<T, unknown>

/**
 * Wraps a potentially throwing function in a Result with custom error mapping.
 *
 * @param fn - Function that may throw
 * @param mapError - Function to transform the caught error
 * @returns Result containing either the return value or the mapped error
 *
 * @example
 * ```typescript
 * const parseNumber = (str: string) =>
 *   tryCatch(
 *     () => {
 *       const n = Number(str)
 *       if (Number.isNaN(n)) throw new Error('Invalid number')
 *       return n
 *     },
 *     (e) => `Parse error: ${e}`
 *   )
 * ```
 */
export function tryCatch<T, E>(fn: () => T, mapError: (error: unknown) => E): Result<T, E>

export function tryCatch<T, E = unknown>(
  fn: () => T,
  mapError?: (error: unknown) => E
): Result<T, E | unknown> {
  try {
    return ok(fn())
  } catch (error) {
    return err(mapError ? mapError(error) : error)
  }
}

/**
 * Wraps an async function in a Result, catching any errors.
 *
 * @param fn - Async function that may throw
 * @returns Promise of Result containing either the value or error
 *
 * @example
 * ```typescript
 * const fetchUser = async (id: string) =>
 *   tryCatchAsync(async () => {
 *     const res = await fetch(`/api/users/${id}`)
 *     return res.json()
 *   })
 *
 * const result = await fetchUser('123')
 * // => Ok({ name: 'John' }) or Err(NetworkError)
 * ```
 */
export async function tryCatchAsync<T>(fn: () => Promise<T>): Promise<Result<T, unknown>>

/**
 * Wraps an async function in a Result with custom error mapping.
 *
 * @param fn - Async function that may throw
 * @param mapError - Function to transform the caught error
 * @returns Promise of Result containing either the value or mapped error
 *
 * @example
 * ```typescript
 * const fetchUser = async (id: string) =>
 *   tryCatchAsync(
 *     async () => {
 *       const res = await fetch(`/api/users/${id}`)
 *       if (!res.ok) throw new Error(`HTTP ${res.status}`)
 *       return res.json()
 *     },
 *     (e) => ({ code: 'FETCH_ERROR', message: String(e) })
 *   )
 * ```
 */
export async function tryCatchAsync<T, E>(
  fn: () => Promise<T>,
  mapError: (error: unknown) => E
): Promise<Result<T, E>>

export async function tryCatchAsync<T, E = unknown>(
  fn: () => Promise<T>,
  mapError?: (error: unknown) => E
): Promise<Result<T, E | unknown>> {
  try {
    const value = await fn()
    return ok(value)
  } catch (error) {
    return err(mapError ? mapError(error) : error)
  }
}
