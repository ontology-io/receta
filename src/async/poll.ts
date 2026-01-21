import type { PollOptions } from './types'
import { sleep } from './retry'
import { timeout, TimeoutError } from './timeout'
import { ok, err, type Result } from '../result'

/**
 * Polls an async function until it returns a truthy value or reaches max attempts.
 *
 * Useful for waiting on async operations like job completion, order status,
 * or resource availability.
 *
 * @param fn - Async function to poll
 * @param options - Polling options
 * @returns Promise resolving to the truthy result
 * @throws Error if max attempts reached or timeout occurs
 *
 * @example
 * ```typescript
 * // Poll until job is complete
 * const job = await poll(
 *   async () => {
 *     const status = await checkJobStatus(jobId)
 *     return status.state === 'completed' ? status : null
 *   },
 *   {
 *     interval: 1000, // Check every second
 *     maxAttempts: 30, // Max 30 attempts (30 seconds)
 *   }
 * )
 *
 * // Poll with timeout
 * const order = await poll(
 *   async () => fetchOrderStatus(orderId),
 *   {
 *     interval: 2000,
 *     timeout: 60000, // Fail after 1 minute
 *     onPoll: (attempt) => console.log(`Checking... attempt ${attempt}`)
 *   }
 * )
 *
 * // Poll until condition is met
 * const result = await poll(
 *   async () => {
 *     const data = await fetchData()
 *     return data.ready ? data : null
 *   },
 *   {
 *     interval: 500,
 *     shouldContinue: (attempt) => attempt < 20
 *   }
 * )
 * ```
 *
 * @see retry - for retrying failed operations
 */
export async function poll<T>(
  fn: () => Promise<T | null | undefined | false>,
  options: PollOptions = {}
): Promise<T> {
  const {
    interval = 1000,
    maxAttempts = 10,
    timeout: timeoutMs,
    shouldContinue,
    onPoll,
  } = options

  const pollImplementation = async (): Promise<T> => {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      // Call onPoll callback if provided
      if (onPoll) {
        onPoll(attempt)
      }

      // Check shouldContinue predicate
      if (shouldContinue && !shouldContinue(attempt)) {
        throw new Error(`Polling stopped at attempt ${attempt}`)
      }

      // Execute the function
      const result = await fn()

      // If result is truthy, we're done
      if (result) {
        return result as T
      }

      // If this was the last attempt, throw error
      if (attempt === maxAttempts) {
        throw new Error(`Polling failed after ${maxAttempts} attempts`)
      }

      // Wait before next attempt
      await sleep(interval)
    }

    throw new Error('Polling failed: max attempts reached')
  }

  // Add timeout if specified
  if (timeoutMs) {
    return timeout(pollImplementation(), timeoutMs)
  }

  return pollImplementation()
}

/**
 * Error type returned by pollResult when polling fails.
 */
export type PollError =
  | { readonly type: 'max_attempts'; readonly attempts: number }
  | { readonly type: 'timeout'; readonly elapsed: number }
  | { readonly type: 'stopped'; readonly attempt: number }

/**
 * Polls an async function returning Result until success or failure.
 *
 * Unlike `poll()` which throws on failure, this returns a Result type
 * for composable, type-safe error handling.
 *
 * @param fn - Async function to poll that returns Result
 * @param options - Polling options
 * @returns Promise resolving to Result with value or poll error
 *
 * @example
 * ```typescript
 * import * as R from 'remeda'
 * import { unwrapOr, mapErr, isOk } from 'receta/result'
 *
 * // Poll with Result
 * const result = await pollResult(
 *   async () => checkJobStatusResult(jobId),
 *   {
 *     interval: 1000,
 *     maxAttempts: 30,
 *     onPoll: (attempt) => console.log(`Checking... attempt ${attempt}`)
 *   }
 * )
 *
 * // Handle with Result pattern
 * const job = R.pipe(
 *   result,
 *   mapErr(error => {
 *     if (error.type === 'max_attempts') {
 *       return 'Job check timed out'
 *     }
 *     return 'Job check failed'
 *   }),
 *   unwrapOr(null)
 * )
 * ```
 *
 * @see poll - for the throwing version
 * @see Result - for error handling patterns
 */
export async function pollResult<T>(
  fn: () => Promise<T | null | undefined | false>,
  options: PollOptions = {}
): Promise<Result<T, PollError>> {
  const {
    interval = 1000,
    maxAttempts = 10,
    timeout: timeoutMs,
    shouldContinue,
    onPoll,
  } = options

  const pollImplementation = async (): Promise<Result<T, PollError>> => {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      // Call onPoll callback if provided
      if (onPoll) {
        onPoll(attempt)
      }

      // Check shouldContinue predicate
      if (shouldContinue && !shouldContinue(attempt)) {
        return err({ type: 'stopped' as const, attempt })
      }

      // Execute the function
      const result = await fn()

      // If result is truthy, we're done
      if (result) {
        return ok(result as T)
      }

      // If this was the last attempt, return error
      if (attempt === maxAttempts) {
        return err({ type: 'max_attempts' as const, attempts: maxAttempts })
      }

      // Wait before next attempt
      await sleep(interval)
    }

    return err({ type: 'max_attempts' as const, attempts: maxAttempts })
  }

  // Add timeout if specified
  if (timeoutMs) {
    try {
      const result = await timeout(pollImplementation(), timeoutMs)
      return result
    } catch (error) {
      if (error instanceof TimeoutError) {
        return err({ type: 'timeout' as const, elapsed: timeoutMs })
      }
      throw error
    }
  }

  return pollImplementation()
}
