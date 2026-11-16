import * as R from 'remeda'
import { retry } from '@ontologyio/receta/async'
import { match, none, some, type Option } from '@ontologyio/receta/option'
import { oneOf } from '@ontologyio/receta/predicate'
import { mapErr, type Result } from '@ontologyio/receta/result'

export type RetryTransientHttpOptions = {
  /** How many attempts in all, the first one included. */
  readonly attempts: number
  /** Wait before the second attempt, doubled before each one after it. Defaults to 200. */
  readonly delayMs?: number
}

export type RetryTransientHttpError = {
  /** `GAVE_UP` when every attempt failed in a way worth retrying, `NOT_RETRYABLE` when one didn't. */
  readonly code: 'GAVE_UP' | 'NOT_RETRYABLE'
  readonly attempts: number
  readonly lastError: unknown
  readonly message: string
}

/** Statuses that mean "try again later": timeouts, too early, rate limits and server trouble. */
const TRANSIENT_STATUSES = [408, 425, 429, 500, 502, 503, 504]

/**
 * The HTTP status on a thrown value: `status` (fetch wrappers, ky), `statusCode` (Node) or
 * the same on `response` (axios, got).
 */
const statusOf = (error: unknown): Option<unknown> => {
  if (!R.isObjectType(error)) return none()
  if ('status' in error) return some(error.status)
  if ('statusCode' in error) return some(error.statusCode)
  if ('response' in error) return statusOf(error.response)
  return none()
}

/** A transient status, or no status at all, which is a network failure such as a reset. */
const isTransient = (error: unknown): boolean =>
  match(statusOf(error), { onSome: oneOf<number, unknown>(TRANSIENT_STATUSES), onNone: R.constant(true) })

/**
 * Retries an HTTP call that fails with a temporary status (408, 425, 429, 5xx gateway errors) or a network error.
 *
 * Use when: calling a third-party API through fetch, axios, got or an SDK, where 429 and 503
 * pass and 400, 401, 404 and 422 never will. The status is read from the thrown error's
 * `status`, `statusCode` or `response.status`. An error with no status at all, such as a
 * reset connection, counts as a network failure and is retried; any other status fails at
 * once.
 *
 * @example
 * ```ts
 * let calls = 0
 * const getInvoice = async () => {
 *   calls += 1
 *   return calls === 1 ? Promise.reject({ status: 503 }) : { id: 'in_1' }
 * }
 * await retryTransientHttp(getInvoice, { attempts: 3, delayMs: 1 })
 * // => Ok({ id: 'in_1' })
 *
 * const notFound = async () => Promise.reject({ response: { status: 404 } })
 * await retryTransientHttp(notFound, { attempts: 3, delayMs: 1 })
 * // => Err({ code: 'NOT_RETRYABLE', attempts: 1, lastError: { response: { status: 404 } }, message: 'Failed with a status that is not retried' })
 *
 * const rateLimited = async () => Promise.reject({ statusCode: 429 })
 * await retryTransientHttp(rateLimited, { attempts: 2, delayMs: 1 })
 * // => Err({ code: 'GAVE_UP', attempts: 2, lastError: { statusCode: 429 }, message: 'Still failing after 2 attempts' })
 * ```
 *
 * @tags retry, http, status, 429, 503, rate limit, fetch, axios, transient
 * @see retryOnCodes - the same policy for error codes such as ECONNRESET
 * @see retry - @ontologyio/receta/async, the retry loop and its shouldRetry option
 */
export async function retryTransientHttp<T>(
  task: () => Promise<T>,
  options: RetryTransientHttpOptions,
): Promise<Result<T, RetryTransientHttpError>> {
  return R.pipe(
    await retry(task, {
      maxAttempts: options.attempts,
      delay: options.delayMs ?? 200,
      shouldRetry: isTransient,
    }),
    mapErr(({ attempts, lastError }): RetryTransientHttpError =>
      isTransient(lastError)
        ? { code: 'GAVE_UP', attempts, lastError, message: `Still failing after ${attempts} attempts` }
        : { code: 'NOT_RETRYABLE', attempts, lastError, message: 'Failed with a status that is not retried' },
    ),
  )
}
