import * as R from 'remeda'
import { err, isErr, ok, tryCatchAsync, type Result } from '@ontologyio/receta/result'

/** One step of a workflow: takes the state so far and returns it updated, or an Err. */
export type RunStepsStep<S, E> = (state: S) => Promise<Result<S, E>>

export type RunStepsError<S, E> =
  | {
      /** The step returned an Err. */
      readonly code: 'STEP_FAILED'
      readonly stepIndex: number
      readonly error: E
      /** The state the failed step started from: everything the steps before it did. */
      readonly state: S
      readonly message: string
    }
  | {
      /** The step threw instead of returning an Err. */
      readonly code: 'STEP_THREW'
      readonly stepIndex: number
      readonly error: unknown
      readonly state: S
      readonly message: string
    }

/**
 * Passes a state through async steps that each return a Result, and stops at the first step that fails.
 *
 * Use when: a workflow is a list of steps that each build on the last, such as checkout
 * (reserve stock, charge, create the shipment) or onboarding (create the account, the
 * workspace, the first project). `pipeAsync` would hand an Err to the next step; this stops
 * there and returns the state the failed step started from, so the caller knows what
 * already happened and can undo or resume it.
 *
 * @example
 * ```ts
 * import { err, ok, type Result } from '@ontologyio/receta/result'
 *
 * type Order = { readonly id: string; readonly reserved: boolean; readonly charged: boolean }
 * const reserve = async (order: Order): Promise<Result<Order, string>> => ok({ ...order, reserved: true })
 * const charge = async (order: Order): Promise<Result<Order, string>> => ok({ ...order, charged: true })
 * const decline = async (_order: Order): Promise<Result<Order, string>> => err('card declined')
 *
 * const order = { id: 'o1', reserved: false, charged: false }
 *
 * await runSteps(order, [reserve, charge])
 * // => Ok({ id: 'o1', reserved: true, charged: true })
 *
 * await runSteps(order, [reserve, decline, charge])
 * // => Err({
 * //   code: 'STEP_FAILED',
 * //   stepIndex: 1,
 * //   error: 'card declined',
 * //   state: { id: 'o1', reserved: true, charged: false },
 * //   message: 'Step 1 returned an Err',
 * // })
 * ```
 *
 * @tags workflow, steps, pipeline, saga, checkout, onboarding, short circuit, state
 * @see runWithRollback - undoes the finished steps when one fails
 * @see pipeAsync - @ontologyio/receta/async, the async pipe without the early stop
 */
export async function runSteps<S, E>(
  initial: S,
  steps: ReadonlyArray<RunStepsStep<S, E>>,
): Promise<Result<S, RunStepsError<S, E>>> {
  const runFrom = async (
    remaining: ReadonlyArray<RunStepsStep<S, E>>,
    stepIndex: number,
    state: S,
  ): Promise<Result<S, RunStepsError<S, E>>> => {
    if (!R.hasAtLeast(remaining, 1)) return ok(state)
    const [step, ...rest] = remaining
    const outcome = await tryCatchAsync(
      () => step(state),
      (error): RunStepsError<S, E> => ({ code: 'STEP_THREW', stepIndex, error, state, message: `Step ${stepIndex} threw` }),
    )
    if (isErr(outcome)) return outcome
    const stepped = outcome.value
    if (isErr(stepped)) {
      return err({ code: 'STEP_FAILED', stepIndex, error: stepped.error, state, message: `Step ${stepIndex} returned an Err` })
    }
    return runFrom(rest, stepIndex + 1, stepped.value)
  }
  return runFrom(steps, 0, initial)
}
