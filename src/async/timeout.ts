import type { TimeoutOptions } from './types'
import { ok, err, type Result } from '../result'

/**
 * Error thrown when a promise times out.
 */
export class TimeoutError extends Error {
  constructor(message: string = 'Operation timed out') {
    super(message)
    this.name = 'TimeoutError'
  }
}

/**
 * Adds a timeout to a promise.
 *
 * If the promise doesn't resolve within the specified time,
 * it will be rejected with a TimeoutError.
 *
 * @param promise - Promise to add timeout to
 * @param ms - Timeout in milliseconds
 * @param options - Timeout options
 * @returns Promise that resolves or times out
 * @throws TimeoutError if the promise times out
 *
 * @example
 * ```typescript
 * // Basic timeout
 * const data = await timeout(
 *   fetch('/api/data'),
 *   5000 // 5 second timeout
 * )
 *
 * // With custom error
 * const result = await timeout(
 *   slowOperation(),
 *   3000,
 *   { timeoutError: new Error('Slow operation timed out') }
 * )
 *
 * // Handling timeout errors
 * try {
 *   const data = await timeout(fetch('/api/data'), 1000)
 * } catch (error) {
 *   if (error instanceof TimeoutError) {
 *     console.log('Request timed out')
 *   }
 * }
 * ```
 *
 * @see retry - for retrying failed operations
 */
export function timeout<T>(promise: Promise<T>, ms: number): Promise<T>

export function timeout<T>(
  promise: Promise<T>,
  ms: number,
  options: TimeoutOptions
): Promise<T>

export function timeout<T>(
  promise: Promise<T>,
  ms: number,
  options?: Partial<TimeoutOptions>
): Promise<T> {
  const timeoutMs = options?.timeout ?? ms
  const error = options?.timeoutError ?? new TimeoutError(`Operation timed out after ${timeoutMs}ms`)

  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(error), timeoutMs)
    }),
  ])
}

/**
 * Adds a timeout to an async function.
 *
 * Returns a new function that wraps the original with a timeout.
 *
 * @param fn - Async function to wrap
 * @param ms - Timeout in milliseconds
 * @param options - Timeout options
 * @returns Wrapped function with timeout
 *
 * @example
 * ```typescript
 * // Create a fetch function with timeout
 * const fetchWithTimeout = timeoutFn(
 *   async (url: string) => {
 *     const res = await fetch(url)
 *     return res.json()
 *   },
 *   5000
 * )
 *
 * // Use it
 * const data = await fetchWithTimeout('/api/data')
 * ```
 *
 * @see timeout - for adding timeout to a single promise
 */
export function timeoutFn<TArgs extends readonly unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  ms: number,
  options?: Partial<TimeoutOptions>
): (...args: TArgs) => Promise<TReturn> {
  return (...args: TArgs) => {
    if (options) {
      return timeout(fn(...args), ms, options as TimeoutOptions)
    }
    return timeout(fn(...args), ms)
  }
}

/**
 * Adds a timeout to a promise, returning a Result.
 *
 * Unlike `timeout()` which throws TimeoutError, this returns a Result type
 * for composable, type-safe error handling.
 *
 * @param promise - Promise to add timeout to
 * @param ms - Timeout in milliseconds
 * @returns Promise resolving to Result with value or TimeoutError
 *
 * @example
 * ```typescript
 * import * as R from 'remeda'
 * import { unwrapOr, mapErr } from 'receta/result'
 *
 * // Basic timeout with Result
 * const result = await timeoutResult(
 *   fetch('/api/data'),
 *   5000
 * )
 *
 * // Handle with Result pattern
 * const data = R.pipe(
 *   result,
 *   mapErr(error => console.error('Timeout:', error)),
 *   unwrapOr({ fallback: 'data' })
 * )
 *
 * // Compose with other async operations
 * const processed = await R.pipe(
 *   timeoutResult(fetchUser(id), 3000),
 *   async (result) => result, // Already a Result
 *   (result) => R.pipe(
 *     result,
 *     map(user => user.email),
 *     unwrapOr('noreply@example.com')
 *   )
 * )
 * ```
 *
 * @see timeout - for the throwing version
 * @see Result - for error handling patterns
 */
export async function timeoutResult<T>(
  promise: Promise<T>,
  ms: number
): Promise<Result<T, TimeoutError>> {
  try {
    const value = await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new TimeoutError(`Operation timed out after ${ms}ms`)), ms)
      }),
    ])
    return ok(value)
  } catch (error) {
    if (error instanceof TimeoutError) {
      return err(error)
    }
    // Re-throw non-timeout errors
    throw error
  }
}
