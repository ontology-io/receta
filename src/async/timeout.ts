import { ok, err, type Result } from '../result'

/**
 * Error type for timeout failures.
 */
export class TimeoutError extends Error {
  constructor(message: string = 'Operation timed out') {
    super(message)
    this.name = 'TimeoutError'
  }
}

/**
 * Adds a timeout to a promise, returning a Result.
 *
 * If the promise doesn't resolve within the specified time,
 * returns an Err with TimeoutError for explicit error handling.
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
 * // Basic timeout
 * const result = await timeout(
 *   fetch('/api/data'),
 *   5000 // 5 second timeout
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
 * const processed = R.pipe(
 *   await timeout(fetchUser(id), 3000),
 *   map(user => user.email),
 *   unwrapOr('noreply@example.com')
 * )
 *
 * // Check timeout errors explicitly
 * const result = await timeout(slowOperation(), 1000)
 * if (isErr(result) && result.error instanceof TimeoutError) {
 *   console.log('Operation timed out')
 * }
 * ```
 *
 * @see retry - for retrying failed operations
 * @see poll - for polling with timeout
 */
export async function timeout<T>(
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
    // Re-throw non-timeout errors (from the original promise)
    throw error
  }
}
