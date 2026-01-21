import type { PollOptions } from './types'
import { sleep } from './retry'
import { timeout as timeoutWithResult, TimeoutError } from './timeout'
import { ok, err, isErr, type Result } from '../result'

/**
 * Error type returned when polling fails.
 */
export type PollError =
  | { readonly type: 'max_attempts'; readonly attempts: number }
  | { readonly type: 'timeout'; readonly elapsed: number }
  | { readonly type: 'stopped'; readonly attempt: number }

/**
 * Polls an async function until it returns a truthy value or reaches max attempts.
 *
 * Useful for waiting on async operations like job completion, order status,
 * or resource availability. Returns Result for explicit error handling.
 *
 * @param fn - Async function to poll
 * @param options - Polling options
 * @returns Promise resolving to Result with value or poll error
 *
 * @example
 * ```typescript
 * import * as R from 'remeda'
 * import { unwrapOr, mapErr } from 'receta/result'
 *
 * // Poll until job is complete
 * const result = await poll(
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
    const result = await timeoutWithResult(pollImplementation(), timeoutMs)

    // If timeout occurred, map to PollError
    if (isErr(result) && result.error instanceof TimeoutError) {
      return err({ type: 'timeout' as const, elapsed: timeoutMs })
    }

    // Otherwise flatten the Result<Result<T, PollError>, TimeoutError> to Result<T, PollError>
    if (isErr(result)) {
      throw result.error // Non-timeout error, shouldn't happen
    }

    return result.value
  }

  return pollImplementation()
}
