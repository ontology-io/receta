import * as R from 'remeda'
import { retry } from '@ontologyio/receta/async'
import { filter, isSome, none, some, type Option } from '@ontologyio/receta/option'
import { oneOf } from '@ontologyio/receta/predicate'
import { mapErr, type Result } from '@ontologyio/receta/result'

export type RetryOnCodesOptions = {
  /** The error codes worth another attempt, such as `ECONNRESET` or `RATE_LIMITED`. */
  readonly codes: readonly string[]
  /** How many attempts in all, the first one included. */
  readonly attempts: number
  /** Wait before the second attempt, doubled before each one after it. Defaults to 200. */
  readonly delayMs?: number
}

export type RetryOnCodesError = {
  /** `GAVE_UP` when every attempt failed with a listed code, `NOT_RETRYABLE` when one didn't. */
  readonly code: 'GAVE_UP' | 'NOT_RETRYABLE'
  readonly attempts: number
  readonly lastError: unknown
  readonly message: string
}

/** The `code` property of a thrown value, such as a Node system error's `ECONNRESET`. */
const codeOf = (error: unknown): Option<unknown> =>
  R.isObjectType(error) && 'code' in error ? some(error.code) : none()

/**
 * Retries an async task only when it fails with one of the listed error codes, and fails at once on any other error.
 *
 * Use when: some failures are temporary and others never go away, such as `ECONNRESET` and
 * `ETIMEDOUT` against `EACCES`, or a service's `RATE_LIMITED` against `INVALID_INPUT`. Plain
 * `retry` would retry a validation error three times before reporting it. The code is read
 * from the thrown value's `code` property; a value without one isn't retried.
 *
 * @example
 * ```ts
 * const codes = ['ECONNRESET', 'ETIMEDOUT']
 *
 * let calls = 0
 * const query = async () => {
 *   calls += 1
 *   return calls === 1 ? Promise.reject({ code: 'ECONNRESET' }) : ['row']
 * }
 * await retryOnCodes(query, { codes, attempts: 3, delayMs: 1 })
 * // => Ok(['row'])
 *
 * const forbidden = async () => Promise.reject({ code: 'EACCES' })
 * await retryOnCodes(forbidden, { codes, attempts: 3, delayMs: 1 })
 * // => Err({ code: 'NOT_RETRYABLE', attempts: 1, lastError: { code: 'EACCES' }, message: 'Failed with an error that is not retried' })
 *
 * const alwaysReset = async () => Promise.reject({ code: 'ECONNRESET' })
 * await retryOnCodes(alwaysReset, { codes, attempts: 2, delayMs: 1 })
 * // => Err({ code: 'GAVE_UP', attempts: 2, lastError: { code: 'ECONNRESET' }, message: 'Still failing after 2 attempts' })
 * ```
 *
 * @tags retry, error code, transient, ECONNRESET, selective, network, database
 * @see retryTransientHttp - the same policy for HTTP status codes
 * @see retry - @ontologyio/receta/async, the retry loop and its shouldRetry option
 */
export async function retryOnCodes<T>(
  task: () => Promise<T>,
  options: RetryOnCodesOptions,
): Promise<Result<T, RetryOnCodesError>> {
  const isListed = (error: unknown): boolean =>
    R.pipe(codeOf(error), filter(oneOf<string, unknown>(options.codes)), isSome)
  return R.pipe(
    await retry(task, {
      maxAttempts: options.attempts,
      delay: options.delayMs ?? 200,
      shouldRetry: isListed,
    }),
    mapErr(({ attempts, lastError }): RetryOnCodesError =>
      isListed(lastError)
        ? { code: 'GAVE_UP', attempts, lastError, message: `Still failing after ${attempts} attempts` }
        : { code: 'NOT_RETRYABLE', attempts, lastError, message: 'Failed with an error that is not retried' },
    ),
  )
}
