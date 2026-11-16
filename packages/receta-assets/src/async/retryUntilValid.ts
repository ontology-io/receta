import * as R from 'remeda'
import { retry } from '@ontologyio/receta/async'
import { match, none, some, type Option } from '@ontologyio/receta/option'
import { mapErr, type Result } from '@ontologyio/receta/result'

export type RetryUntilValidOptions = {
  /** How many attempts in all, the first one included. */
  readonly attempts: number
  /** Wait before the second attempt, doubled before each one after it. Defaults to 200. */
  readonly delayMs?: number
}

export type RetryUntilValidError<T> =
  | {
      /** The last attempt returned a value that didn't pass. */
      readonly code: 'NEVER_VALID'
      readonly attempts: number
      readonly lastValue: T
      readonly message: string
    }
  | {
      /** The last attempt threw. */
      readonly code: 'FAILED'
      readonly attempts: number
      readonly error: unknown
      readonly message: string
    }

/**
 * Retries an async read with backoff until the value it returns passes a check, treating a stale value like an error.
 *
 * Use when: reading right after a write to a system that catches up a moment later, such as
 * a search index, a read replica, an eventually consistent store or a webhook that lands
 * after the redirect. Both a value that fails `isValid` and a thrown error get another
 * attempt, after a growing delay. The error says which of the two the last attempt was.
 *
 * @example
 * ```ts
 * const indexed = [[], [], ['order_9']]
 * let reads = 0
 * const searchOrders = async () => indexed[reads++] ?? []
 * const hasOrder = (ids: string[]) => ids.includes('order_9')
 *
 * await retryUntilValid(searchOrders, hasOrder, { attempts: 4, delayMs: 1 })
 * // => Ok(['order_9'])
 *
 * const neverIndexed = async (): Promise<string[]> => []
 * await retryUntilValid(neverIndexed, hasOrder, { attempts: 2, delayMs: 1 })
 * // => Err({ code: 'NEVER_VALID', attempts: 2, lastValue: [], message: 'No valid value after 2 attempts' })
 * ```
 *
 * @tags retry, eventual consistency, read after write, stale, replica, index, validate
 * @see pollUntil - waits at a steady interval and stops when the check throws
 * @see retry - @ontologyio/receta/async, the retry loop, which only retries throws
 */
export async function retryUntilValid<T>(
  task: () => Promise<T>,
  isValid: (value: T) => boolean,
  options: RetryUntilValidOptions,
): Promise<Result<T, RetryUntilValidError<T>>> {
  // The value of the attempt that just ran, when it didn't pass.
  let lastInvalid: Option<T> = none()

  const attempt = async (): Promise<T> => {
    lastInvalid = none()
    const value = await task()
    if (isValid(value)) return value
    lastInvalid = some(value)
    // retry asks for another attempt when the attempt throws.
    throw value
  }

  return R.pipe(
    await retry(attempt, { maxAttempts: options.attempts, delay: options.delayMs ?? 200 }),
    mapErr(({ attempts, lastError }) =>
      match(lastInvalid, {
        onSome: (lastValue): RetryUntilValidError<T> => ({
          code: 'NEVER_VALID',
          attempts,
          lastValue,
          message: `No valid value after ${attempts} attempts`,
        }),
        onNone: (): RetryUntilValidError<T> => ({
          code: 'FAILED',
          attempts,
          error: lastError,
          message: `Attempt ${attempts} failed`,
        }),
      }),
    ),
  )
}
