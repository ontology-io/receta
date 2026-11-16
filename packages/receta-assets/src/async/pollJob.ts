import * as R from 'remeda'
import { poll } from '@ontologyio/receta/async'
import { none, some, type Option, type Some } from '@ontologyio/receta/option'
import { err, flatMap, mapErr, ok, tryCatchAsync, type Result } from '@ontologyio/receta/result'

/** Where a job stands, as the caller's `classify` reads it from a status. */
export type PollJobState = 'done' | 'failed' | 'pending'

export type PollJobOptions<S> = {
  /** Reads a status: `done` and `failed` stop the wait, `pending` checks again. */
  readonly classify: (status: S) => PollJobState
  /** Wait between one check finishing and the next starting. */
  readonly intervalMs: number
  /** How many checks in all before giving up. */
  readonly maxAttempts: number
}

export type PollJobError<S> =
  | { readonly code: 'JOB_FAILED'; readonly status: S; readonly message: string }
  | {
      readonly code: 'STILL_PENDING'
      readonly attempts: number
      readonly lastStatus: Option<S>
      readonly message: string
    }
  | { readonly code: 'CHECK_FAILED'; readonly error: unknown; readonly message: string }

/**
 * Polls a background job's status until it finishes or fails, and stops as soon as either happens.
 *
 * Use when: an API starts work and hands back a job to check, such as a video transcode, a
 * CI run, a bulk import or a model fine-tune. A job that reports failure ends the wait at
 * once with its status, instead of being polled until attempts run out. `classify` maps the
 * API's own states, such as `succeeded`, `errored` and `in_progress`, to these three.
 *
 * ```text
 *  ┌──────────────┐  done    ╭────────────╮
 *  │ check status │─────────▶│ Ok(status) │
 *  │ classify it  │          ╰────────────╯
 *  │              │  failed  ╭─────────────────────────────────────╮
 *  │              │─────────▶│ Err({ code: 'JOB_FAILED', status }) │
 *  └──────┬───────┘          ╰─────────────────────────────────────╯
 *         │ pending
 *         ▼
 *  ⟨ attempts left ⟩──no──▶ ╭────────────────────────────────╮
 *         │ yes             │ Err({ code: 'STILL_PENDING' }) │
 *         ▼                 ╰────────────────────────────────╯
 *  wait intervalMs ──▶ check status again
 * ```
 *
 * @example
 * ```ts
 * type Run = { readonly id: string; readonly state: 'in_progress' | 'succeeded' | 'errored' }
 * const classify = (run: Run) =>
 *   run.state === 'succeeded' ? 'done' : run.state === 'errored' ? 'failed' : 'pending'
 *
 * const states: Run['state'][] = ['in_progress', 'in_progress', 'succeeded']
 * let checks = 0
 * const getRun = async (): Promise<Run> => ({ id: 'run_1', state: states[checks++] ?? 'succeeded' })
 *
 * await pollJob(getRun, { classify, intervalMs: 1, maxAttempts: 5 })
 * // => Ok({ id: 'run_1', state: 'succeeded' })
 *
 * const errored = async (): Promise<Run> => ({ id: 'run_2', state: 'errored' })
 * await pollJob(errored, { classify, intervalMs: 1, maxAttempts: 5 })
 * // => Err({ code: 'JOB_FAILED', status: { id: 'run_2', state: 'errored' }, message: 'The job failed' })
 * ```
 *
 * @tags poll, job, status, background, wait, ci, transcode, long running
 * @see pollUntil - waits for a value to pass one test, with no failed state
 * @see poll - @ontologyio/receta/async, the loop underneath
 */
export async function pollJob<S>(
  check: () => Promise<S>,
  options: PollJobOptions<S>,
): Promise<Result<S, PollJobError<S>>> {
  let lastStatus: Option<S> = none()
  // poll stops at anything but null, undefined or false, so a finished job goes out in a Some.
  const attempt = async (): Promise<Some<S> | false> => {
    const status = await check()
    lastStatus = some(status)
    return options.classify(status) !== 'pending' && some(status)
  }
  const polled = await tryCatchAsync(
    () => poll(attempt, { interval: options.intervalMs, maxAttempts: options.maxAttempts }),
    (error): PollJobError<S> => ({ code: 'CHECK_FAILED', error, message: 'Checking the job failed' }),
  )
  return R.pipe(
    polled,
    flatMap((outcome) =>
      mapErr(outcome, (): PollJobError<S> => ({
        code: 'STILL_PENDING',
        attempts: options.maxAttempts,
        lastStatus,
        message: `The job was still pending after ${options.maxAttempts} checks`,
      })),
    ),
    flatMap(({ value: status }) =>
      options.classify(status) === 'done'
        ? ok(status)
        : err<PollJobError<S>>({ code: 'JOB_FAILED', status, message: 'The job failed' }),
    ),
  )
}
