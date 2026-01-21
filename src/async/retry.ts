import type { RetryOptions } from './types'
import { ok, err, type Result } from '../result'

/**
 * Retries an async function with exponential backoff.
 *
 * Useful for handling transient failures like network errors, rate limits,
 * or temporary service unavailability.
 *
 * @param fn - Async function to retry
 * @param options - Retry options
 * @returns Promise resolving to the result of fn
 * @throws The last error if all retry attempts fail
 *
 * @example
 * ```typescript
 * // Basic retry with defaults (3 attempts, exponential backoff)
 * const data = await retry(async () => {
 *   const res = await fetch('/api/data')
 *   if (!res.ok) throw new Error(`HTTP ${res.status}`)
 *   return res.json()
 * })
 *
 * // Custom retry options
 * const result = await retry(
 *   async () => fetchData(),
 *   {
 *     maxAttempts: 5,
 *     delay: 500,
 *     backoff: 2,
 *     maxDelay: 10000,
 *     shouldRetry: (error, attempt) => {
 *       // Only retry on specific errors
 *       return error instanceof NetworkError && attempt < 3
 *     },
 *     onRetry: (error, attempt, delay) => {
 *       console.log(`Retry ${attempt} after ${delay}ms:`, error)
 *     }
 *   }
 * )
 *
 * // Retry with constant delay (no backoff)
 * const fixed = await retry(
 *   async () => checkStatus(),
 *   { delay: 1000, backoff: 1 }
 * )
 * ```
 *
 * @see poll - for polling until a condition is met
 * @see timeout - for adding timeout to promises
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delay: initialDelay = 1000,
    backoff = 2,
    maxDelay = 30000,
    shouldRetry,
    onRetry,
  } = options

  let lastError: unknown
  let currentDelay = initialDelay

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      // Check if we should retry this error
      if (shouldRetry && !shouldRetry(error, attempt)) {
        throw error
      }

      // If this was the last attempt, throw the error
      if (attempt === maxAttempts) {
        throw error
      }

      // Calculate delay with exponential backoff
      const delayMs = Math.min(currentDelay, maxDelay)

      // Call onRetry callback if provided
      if (onRetry) {
        onRetry(error, attempt, delayMs)
      }

      // Wait before retrying
      await sleep(delayMs)

      // Increase delay for next attempt
      currentDelay = currentDelay * backoff
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError
}

/**
 * Error type returned by retryResult when all retry attempts fail.
 */
export interface RetryError {
  readonly type: 'max_attempts_exceeded'
  readonly lastError: unknown
  readonly attempts: number
}

/**
 * Retries an async function with exponential backoff, returning a Result.
 *
 * Unlike `retry()` which throws on failure, this returns a Result type
 * for composable, type-safe error handling.
 *
 * @param fn - Async function to retry
 * @param options - Retry options
 * @returns Promise resolving to Result containing either the value or retry error
 *
 * @example
 * ```typescript
 * import { pipe } from 'remeda'
 * import { unwrapOr, mapErr } from 'receta/result'
 *
 * // Basic retry with Result
 * const result = await retryResult(async () => {
 *   const res = await fetch('/api/data')
 *   if (!res.ok) throw new Error(`HTTP ${res.status}`)
 *   return res.json()
 * })
 *
 * // Handle with Result pattern
 * const data = pipe(
 *   result,
 *   mapErr(error => console.error('Failed after retries:', error)),
 *   unwrapOr({ default: 'data' })
 * )
 *
 * // Compose with other Result operations
 * const processed = pipe(
 *   await retryResult(() => fetchUser(id)),
 *   map(user => user.email),
 *   unwrapOr('noreply@example.com')
 * )
 * ```
 *
 * @see retry - for the throwing version
 * @see Result - for error handling patterns
 */
export async function retryResult<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<Result<T, RetryError>> {
  const {
    maxAttempts = 3,
    delay: initialDelay = 1000,
    backoff = 2,
    maxDelay = 30000,
    shouldRetry,
    onRetry,
  } = options

  let lastError: unknown
  let currentDelay = initialDelay

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const value = await fn()
      return ok(value)
    } catch (error) {
      lastError = error

      // Check if we should retry this error
      if (shouldRetry && !shouldRetry(error, attempt)) {
        return err({
          type: 'max_attempts_exceeded' as const,
          lastError: error,
          attempts: attempt,
        })
      }

      // If this was the last attempt, return error
      if (attempt === maxAttempts) {
        return err({
          type: 'max_attempts_exceeded' as const,
          lastError: error,
          attempts: attempt,
        })
      }

      // Calculate delay with exponential backoff
      const delayMs = Math.min(currentDelay, maxDelay)

      // Call onRetry callback if provided
      if (onRetry) {
        onRetry(error, attempt, delayMs)
      }

      // Wait before retrying
      await sleep(delayMs)

      // Increase delay for next attempt
      currentDelay = currentDelay * backoff
    }
  }

  // This should never be reached, but TypeScript needs it
  return err({
    type: 'max_attempts_exceeded' as const,
    lastError,
    attempts: maxAttempts,
  })
}

/**
 * Sleep for a specified duration.
 *
 * @param ms - Duration in milliseconds
 * @returns Promise that resolves after the duration
 *
 * @example
 * ```typescript
 * // Wait 1 second
 * await sleep(1000)
 *
 * // Use in sequence
 * console.log('Starting...')
 * await sleep(2000)
 * console.log('2 seconds later')
 * ```
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
