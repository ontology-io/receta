import * as R from 'remeda'
import { timeout } from '@ontologyio/receta/async'
import { err, isErr, isOk, ok, tryCatchAsync, type Result } from '@ontologyio/receta/result'

export type WithDeadlineError =
  | {
      readonly code: 'DEADLINE_EXCEEDED'
      readonly deadlineMs: number
      /** How many steps finished before the deadline. */
      readonly completedSteps: number
      readonly message: string
    }
  | { readonly code: 'STEP_FAILED'; readonly stepIndex: number; readonly error: unknown; readonly message: string }

/**
 * Runs async steps one after another under one deadline for all of them, and starts no step once it has passed.
 *
 * Use when: a request has one budget for several calls in a row, such as 2 seconds to check
 * auth, read the database and render, and a per-call timeout would let three slow calls add
 * up to three times the budget. When the deadline passes, the caller gets an Err at once;
 * the step that was running keeps running, because a promise can't be cancelled, but the
 * steps after it never start.
 *
 * ```text
 *  0 ms                                  deadlineMs
 *  ├── step 0 ──▶ step 1 ──▶ step 2 ─────────┼──▶ step 3 never starts
 *  │
 *  │ every step done in time ──▶ Ok([value 0, value 1, …])
 *  │ a step fails first ───────▶ Err({ code: 'STEP_FAILED', stepIndex })
 *  │ deadlineMs passes first ──▶ Err({ code: 'DEADLINE_EXCEEDED' })
 * ```
 *
 * @example
 * ```ts
 * import { sleep } from '@ontologyio/receta/async'
 *
 * const started: string[] = []
 * const step = (name: string, ms: number) => async () => {
 *   started.push(name)
 *   await sleep(ms)
 *   return name
 * }
 *
 * await withDeadline([step('auth', 1), step('load', 1)], 30)
 * // => Ok(['auth', 'load'])
 *
 * await withDeadline([step('auth', 1), step('report', 40), step('email', 1)], 15)
 * // => Err({ code: 'DEADLINE_EXCEEDED', deadlineMs: 15, completedSteps: 1, message: 'Ran past the 15 ms deadline after 1 steps' })
 *
 * await sleep(40)
 * started
 * // => ['auth', 'load', 'auth', 'report']
 * ```
 *
 * @tags deadline, budget, timeout, sequential, steps, request, sla
 * @see withTimeLimit - one time limit for one task
 * @see timeout - @ontologyio/receta/async, the race against the clock
 */
export async function withDeadline<T>(
  steps: ReadonlyArray<() => Promise<T>>,
  deadlineMs: number,
): Promise<Result<T[], WithDeadlineError>> {
  let expired = false
  let completedSteps = 0

  const runFrom = async (
    remaining: ReadonlyArray<() => Promise<T>>,
    values: readonly T[],
  ): Promise<Result<T[], WithDeadlineError>> => {
    // Past the deadline the caller already has its Err, so nothing after the running step starts.
    if (expired || !R.hasAtLeast(remaining, 1)) return ok([...values])
    const [step, ...rest] = remaining
    const stepIndex = values.length
    const outcome = await tryCatchAsync(
      step,
      (error): WithDeadlineError => ({ code: 'STEP_FAILED', stepIndex, error, message: `Step ${stepIndex} failed` }),
    )
    if (isErr(outcome)) return outcome
    completedSteps = stepIndex + 1
    return runFrom(rest, [...values, outcome.value])
  }

  const run = await timeout(runFrom(steps, []), deadlineMs)
  if (isOk(run)) return run.value
  expired = true
  return err({
    code: 'DEADLINE_EXCEEDED',
    deadlineMs,
    completedSteps,
    message: `Ran past the ${deadlineMs} ms deadline after ${completedSteps} steps`,
  })
}
