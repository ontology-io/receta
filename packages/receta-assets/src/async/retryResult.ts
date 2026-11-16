import * as R from 'remeda'
import { retry } from '@ontologyio/receta/async'
import { isSome, match, none, some, type Option } from '@ontologyio/receta/option'
import { isOk, mapErr, type Result } from '@ontologyio/receta/result'

export type RetryResultOptions<E> = {
  /** How many attempts in all, the first one included. */
  readonly attempts: number
  /** Wait before the second attempt, doubled before each one after it. Defaults to 200. */
  readonly delayMs?: number
  /** Which errors are worth another attempt. Defaults to every Err. */
  readonly isRetryable?: (error: E) => boolean
}

export type RetryResultError<E> =
  | {
      /** The last attempt returned this Err, or returned one that isn't retryable. */
      readonly code: 'FAILED'
      readonly attempts: number
      readonly error: E
      readonly message: string
    }
  | {
      /** The task threw instead of returning an Err. That is a bug, so it isn't retried. */
      readonly code: 'THREW'
      readonly attempts: number
      readonly error: unknown
      readonly message: string
    }

/**
 * Retries an async task that reports failure by returning an Err, until it returns Ok or attempts run out.
 *
 * Use when: the task already speaks Result, such as a client wrapped in `tryCatchAsync` or
 * a service function that returns `Err({ code })`. Receta's `retry` only retries when the
 * task throws, so an Err would count as success there. Pass `isRetryable` to stop at once
 * on an error that another attempt can't fix, such as a declined card.
 *
 * ```text
 *  ┌───────────┐  Ok(value)   ╭───────────╮
 *  │ attempt n │─────────────▶│ Ok(value) │
 *  └─────┬─────┘              ╰───────────╯
 *        │ Err(e)
 *        ▼
 *  ⟨ isRetryable(e) and n < attempts ⟩──no──▶ ╭─────────────────────────╮
 *        │ yes                                │ Err({ code: 'FAILED' }) │
 *        ▼                                    ╰─────────────────────────╯
 *  wait delayMs × 2ⁿ⁻¹ ──▶ attempt n + 1
 * ```
 *
 * @example
 * ```ts
 * import { err, ok, type Result } from '@ontologyio/receta/result'
 * import { eq, where } from '@ontologyio/receta/predicate'
 *
 * type ChargeError = { readonly code: 'RATE_LIMITED' | 'CARD_DECLINED' }
 * const isRetryable = where<ChargeError>({ code: eq('RATE_LIMITED') })
 *
 * let calls = 0
 * const charge = async (): Promise<Result<string, ChargeError>> => {
 *   calls += 1
 *   return calls < 3 ? err({ code: 'RATE_LIMITED' }) : ok('ch_123')
 * }
 * await retryResult(charge, { attempts: 3, delayMs: 1, isRetryable })
 * // => Ok('ch_123')
 *
 * const declined = async (): Promise<Result<string, ChargeError>> => err({ code: 'CARD_DECLINED' })
 * await retryResult(declined, { attempts: 3, delayMs: 1, isRetryable })
 * // => Err({ code: 'FAILED', attempts: 1, error: { code: 'CARD_DECLINED' }, message: 'Attempt 1 returned an Err' })
 * ```
 *
 * @tags retry, result, err, backoff, transient, rate limit, resilience
 * @see retry - @ontologyio/receta/async, the retry loop, which only retries throws
 * @see retryWithTimeout - retries a task that throws, with a time limit per attempt
 */
export async function retryResult<T, E>(
  task: () => Promise<Result<T, E>>,
  options: RetryResultOptions<E>,
): Promise<Result<T, RetryResultError<E>>> {
  const isRetryable = options.isRetryable ?? R.constant(true)
  // The Err of the attempt that just ran. A throw with nothing here came from the task itself.
  let lastErr: Option<E> = none()

  const attempt = async (): Promise<T> => {
    lastErr = none()
    const outcome = await task()
    if (isOk(outcome)) return outcome.value
    lastErr = some(outcome.error)
    // retry asks for another attempt when the attempt throws.
    throw outcome.error
  }

  const retried = await retry(attempt, {
    maxAttempts: options.attempts,
    delay: options.delayMs ?? 200,
    shouldRetry: () => isSome(lastErr) && isRetryable(lastErr.value),
  })

  return R.pipe(
    retried,
    mapErr(({ attempts, lastError }) =>
      match(lastErr, {
        onSome: (error): RetryResultError<E> => ({
          code: 'FAILED',
          attempts,
          error,
          message: `Attempt ${attempts} returned an Err`,
        }),
        onNone: (): RetryResultError<E> => ({
          code: 'THREW',
          attempts,
          error: lastError,
          message: `Attempt ${attempts} threw instead of returning an Err`,
        }),
      }),
    ),
  )
}
