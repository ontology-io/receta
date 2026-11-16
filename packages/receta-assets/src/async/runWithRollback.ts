import * as R from 'remeda'
import { mapAsync } from '@ontologyio/receta/async'
import { err, isOk, ok, partition, tryCatchAsync, unwrapOr, type Result } from '@ontologyio/receta/result'

/** One step: `run` does the work, `undo` reverses it given what `run` returned. */
export type RunWithRollbackStep<T> = {
  readonly run: () => Promise<T>
  readonly undo: (value: T) => Promise<unknown>
}

export type RunWithRollbackUndoError = { readonly step: number; readonly error: unknown }

export type RunWithRollbackError = {
  /** `ROLLED_BACK` when every undo worked, `ROLLBACK_FAILED` when some didn't and need a person. */
  readonly code: 'ROLLED_BACK' | 'ROLLBACK_FAILED'
  readonly failedStep: number
  readonly error: unknown
  readonly undoErrors: readonly RunWithRollbackUndoError[]
  readonly message: string
}

/** A finished step, ready to be undone. */
type Done = { readonly step: number; readonly undo: () => Promise<unknown> }

const rollBack = async (failedStep: number, error: unknown, done: readonly Done[]): Promise<RunWithRollbackError> => {
  const undoOne = ({ step, undo }: Done) =>
    tryCatchAsync(undo, (undoError): RunWithRollbackUndoError => ({ step, error: undoError }))
  // Newest first, one at a time, and an undo that fails doesn't stop the ones after it.
  const undone = await mapAsync(R.reverse(done), undoOne, { concurrency: 1 })
  const [, undoErrors] = partition(unwrapOr(undone, []))
  return undoErrors.length === 0
    ? {
        code: 'ROLLED_BACK',
        failedStep,
        error,
        undoErrors,
        message: `Step ${failedStep} failed, and the ${done.length} steps before it were undone`,
      }
    : {
        code: 'ROLLBACK_FAILED',
        failedStep,
        error,
        undoErrors,
        message: `Step ${failedStep} failed, and ${undoErrors.length} of ${done.length} undo steps failed too`,
      }
}

/**
 * Runs async steps in order, and when one fails, undoes the steps that finished, newest first.
 *
 * Use when: one action spans several systems with no shared transaction, such as signing a
 * user up in the auth provider, the database and the billing system, and a failure halfway
 * must not leave half an account behind. Each step brings its own `undo`, which gets what
 * its `run` returned. `ROLLBACK_FAILED` means some undo failed too, and lists which.
 *
 * ```text
 *  step 0 ──ok──▶ step 1 ──ok──▶ step 2 ──ok──▶ ╭──────────────────────╮
 *                                  │            │ Ok([v0, v1, v2])     │
 *                                  │ fails      ╰──────────────────────╯
 *                                  ▼
 *               undo step 1 ──▶ undo step 0
 *                                  │
 *                    ⟨ every undo worked ⟩──yes──▶ ╭──────────────────────╮
 *                                  │               │ Err(ROLLED_BACK)     │
 *                                  │ no            ╰──────────────────────╯
 *                                  ▼
 *                       ╭──────────────────────╮
 *                       │ Err(ROLLBACK_FAILED) │
 *                       ╰──────────────────────╯
 * ```
 *
 * @example
 * ```ts
 * const log: string[] = []
 * const account = {
 *   run: async () => 'acc_1',
 *   undo: async (id: string) => log.push(`deleted ${id}`),
 * }
 * const workspace = {
 *   run: async () => 'ws_1',
 *   undo: async (id: string) => log.push(`deleted ${id}`),
 * }
 * const invite = {
 *   run: async (): Promise<string> => Promise.reject('mail server down'),
 *   undo: async () => 'nothing to undo',
 * }
 *
 * await runWithRollback([account, workspace])
 * // => Ok(['acc_1', 'ws_1'])
 *
 * await runWithRollback([account, workspace, invite])
 * // => Err({
 * //   code: 'ROLLED_BACK',
 * //   failedStep: 2,
 * //   error: 'mail server down',
 * //   undoErrors: [],
 * //   message: 'Step 2 failed, and the 2 steps before it were undone',
 * // })
 *
 * log
 * // => ['deleted ws_1', 'deleted acc_1']
 * ```
 *
 * @tags saga, rollback, compensate, undo, transaction, distributed, signup, cleanup
 * @see runSteps - stops at the first failure without undoing anything
 * @see mapAsync - @ontologyio/receta/async, runs the undo steps one at a time
 */
export async function runWithRollback<const Values extends readonly unknown[]>(steps: {
  readonly [K in keyof Values]: RunWithRollbackStep<Values[K]>
}): Promise<Result<Values, RunWithRollbackError>> {
  // Each step's value has its own type; past this point the steps are handled alike.
  const all = steps as unknown as ReadonlyArray<RunWithRollbackStep<unknown>>

  const runFrom = async (
    remaining: ReadonlyArray<RunWithRollbackStep<unknown>>,
    done: readonly Done[],
    values: readonly unknown[],
  ): Promise<Result<Values, RunWithRollbackError>> => {
    if (!R.hasAtLeast(remaining, 1)) return ok(values as unknown as Values)
    const [step, ...rest] = remaining
    const outcome = await tryCatchAsync(step.run)
    if (!isOk(outcome)) return err(await rollBack(values.length, outcome.error, done))
    const finished = { step: values.length, undo: () => step.undo(outcome.value) }
    return runFrom(rest, [...done, finished], [...values, outcome.value])
  }

  return runFrom(all, [], [])
}
