import { mapAsync } from '@ontologyio/receta/async'
import { partition, tryCatchAsync, unwrapOr } from '@ontologyio/receta/result'

export type MapSettledFailure<T> = {
  readonly index: number
  readonly item: T
  readonly error: unknown
}

export type MapSettledOutcome<T, U> = {
  /** What each item that succeeded mapped to, in the order of the items. */
  readonly values: readonly U[]
  /** Each item that failed, with its position in the input. */
  readonly failures: readonly MapSettledFailure<T>[]
}

export type MapSettledOptions = {
  /** How many items run at once. Defaults to all of them. */
  readonly concurrency?: number
}

/**
 * Maps every item with an async function and keeps going past failures, returning the values and the failures apart.
 *
 * Use when: a bulk job should do as much as it can and report the rest, such as sending a
 * batch of emails, resizing uploaded images or syncing records, where one bad item must not
 * stop the others. `mapAsync` stops at the first failure; this never does, and each failure
 * keeps its index and item so the caller can retry or report exactly those.
 *
 * @example
 * ```ts
 * const send = async (to: string) =>
 *   to.endsWith('.invalid') ? Promise.reject('bounced') : `sent to ${to}`
 *
 * await mapSettled(['ada@mail.io', 'bob@mail.invalid', 'cy@mail.io'], send, { concurrency: 2 })
 * // => {
 * //   values: ['sent to ada@mail.io', 'sent to cy@mail.io'],
 * //   failures: [{ index: 1, item: 'bob@mail.invalid', error: 'bounced' }],
 * // }
 *
 * await mapSettled([], send)
 * // => { values: [], failures: [] }
 * ```
 *
 * @tags bulk, settle, partial failure, best effort, allSettled, batch, report
 * @see mapAsync - @ontologyio/receta/async, the concurrency control, which stops at the first failure
 * @see settleRecord - the same for a record of different tasks
 */
export async function mapSettled<T, U>(
  items: readonly T[],
  fn: (item: T, index: number) => Promise<U>,
  options: MapSettledOptions = {},
): Promise<MapSettledOutcome<T, U>> {
  const settled = await mapAsync(
    items,
    (item, index) =>
      tryCatchAsync(
        () => fn(item, index),
        (error): MapSettledFailure<T> => ({ index, item, error }),
      ),
    options,
  )
  // Each mapper returns a Result instead of rejecting, so mapAsync itself always succeeds.
  const [values, failures] = partition(unwrapOr(settled, []))
  return { values, failures }
}
