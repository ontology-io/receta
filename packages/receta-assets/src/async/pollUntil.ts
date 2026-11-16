import * as R from 'remeda'
import { poll } from '@ontologyio/receta/async'
import { none, some, type Option, type Some } from '@ontologyio/receta/option'
import { flatMap, map, mapErr, tryCatchAsync, type Result } from '@ontologyio/receta/result'

export type PollUntilOptions = {
  /** Wait between one check finishing and the next starting. */
  readonly intervalMs: number
  /** How many checks in all before giving up. */
  readonly maxAttempts: number
}

export type PollUntilError<T> =
  | {
      readonly code: 'NOT_READY'
      readonly attempts: number
      /** What the last check returned, to show or log why it never passed. */
      readonly lastValue: Option<T>
      readonly message: string
    }
  | { readonly code: 'CHECK_FAILED'; readonly error: unknown; readonly message: string }

/**
 * Calls an async check at a steady interval until its value passes a test, and returns that value.
 *
 * Use when: waiting for something another system is doing, such as an export file being
 * ready, a deployment answering, or a payment reaching `succeeded`. Any value can pass,
 * including `0` and `''`, unlike `poll`, which treats falsy values as "not yet". A check
 * that throws stops the wait at once with `CHECK_FAILED`.
 *
 * @example
 * ```ts
 * const statuses = ['queued', 'running', 'ready']
 * let checks = 0
 * const exportStatus = async () => statuses[checks++] ?? 'ready'
 *
 * await pollUntil(exportStatus, (status) => status === 'ready', { intervalMs: 1, maxAttempts: 5 })
 * // => Ok('ready')
 *
 * const alwaysQueued = async () => 'queued'
 * await pollUntil(alwaysQueued, (status) => status === 'ready', { intervalMs: 1, maxAttempts: 3 })
 * // => Err({ code: 'NOT_READY', attempts: 3, lastValue: Some('queued'), message: 'Still not ready after 3 checks' })
 *
 * const pendingJobs = async () => 0
 * await pollUntil(pendingJobs, (count) => count === 0, { intervalMs: 1, maxAttempts: 3 })
 * // => Ok(0)
 * ```
 *
 * @tags poll, wait, ready, status, until, interval, eventual, job
 * @see pollJob - tells a finished job from a failed one, and stops at either
 * @see poll - @ontologyio/receta/async, the loop underneath, which stops on any truthy value
 */
export async function pollUntil<T>(
  check: () => Promise<T>,
  isReady: (value: T) => boolean,
  options: PollUntilOptions,
): Promise<Result<T, PollUntilError<T>>> {
  let lastValue: Option<T> = none()
  // poll stops at anything but null, undefined or false, so a ready value goes out in a Some.
  const attempt = async (): Promise<Some<T> | false> => {
    const value = await check()
    lastValue = some(value)
    return isReady(value) && some(value)
  }
  const polled = await tryCatchAsync(
    () => poll(attempt, { interval: options.intervalMs, maxAttempts: options.maxAttempts }),
    (error): PollUntilError<T> => ({ code: 'CHECK_FAILED', error, message: 'The check failed' }),
  )
  return R.pipe(
    polled,
    flatMap((outcome) =>
      mapErr(outcome, (): PollUntilError<T> => ({
        code: 'NOT_READY',
        attempts: options.maxAttempts,
        lastValue,
        message: `Still not ready after ${options.maxAttempts} checks`,
      })),
    ),
    map((ready) => ready.value),
  )
}
