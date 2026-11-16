import * as R from 'remeda'
import { mapAsync, retry } from '@ontologyio/receta/async'
import { collect, mapErr, unwrapOr, type Result } from '@ontologyio/receta/result'

export type MapWithRetryOptions = {
  /** Attempts per item, the first one included. */
  readonly attempts: number
  /** Wait before an item's second attempt, doubled before each one after it. Defaults to 200. */
  readonly delayMs?: number
  /** How many items run at once. Defaults to all of them. */
  readonly concurrency?: number
}

export type MapWithRetryError<T> = {
  readonly code: 'ITEM_FAILED'
  readonly index: number
  readonly item: T
  /** How many attempts the item got before it was given up. */
  readonly attempts: number
  /** What the item's last attempt threw. */
  readonly error: unknown
  readonly message: string
}

/**
 * Maps items with an async function, retrying each item on its own, and fails with the first item that never succeeded.
 *
 * Use when: each item is an independent call that sometimes fails for a moment, such as
 * uploading files, fetching thumbnails or calling a webhook per record. One retry of the
 * whole list would redo every item; this retries only the item that failed. Every item runs
 * to the end even after another gives up, and the first failure in list order comes back.
 *
 * @example
 * ```ts
 * const failuresLeft = new Map([['b.png', 1]])
 * const upload = async (file: string) => {
 *   const left = failuresLeft.get(file) ?? 0
 *   failuresLeft.set(file, left - 1)
 *   if (left > 0) throw new Error('503')
 *   return `stored ${file}`
 * }
 *
 * await mapWithRetry(['a.png', 'b.png'], upload, { attempts: 2, delayMs: 1 })
 * // => Ok(['stored a.png', 'stored b.png'])
 *
 * const rejectsHuge = async (file: string) =>
 *   file === 'huge.mov' ? Promise.reject('413') : `stored ${file}`
 *
 * await mapWithRetry(['a.png', 'huge.mov'], rejectsHuge, { attempts: 2, delayMs: 1 })
 * // => Err({ code: 'ITEM_FAILED', index: 1, item: 'huge.mov', attempts: 2, error: '413', message: 'Item 1 failed after 2 attempts' })
 * ```
 *
 * @tags retry, per item, bulk, upload, transient, concurrency, map
 * @see retry - @ontologyio/receta/async, the retry loop each item gets
 * @see mapSettled - keeps every failure instead of returning the first
 */
export async function mapWithRetry<T, U>(
  items: readonly T[],
  fn: (item: T, index: number) => Promise<U>,
  options: MapWithRetryOptions,
): Promise<Result<U[], MapWithRetryError<T>>> {
  const retryOne = async (item: T, index: number): Promise<Result<U, MapWithRetryError<T>>> =>
    R.pipe(
      await retry(() => fn(item, index), { maxAttempts: options.attempts, delay: options.delayMs ?? 200 }),
      mapErr(({ attempts, lastError }): MapWithRetryError<T> => ({
        code: 'ITEM_FAILED',
        index,
        item,
        attempts,
        error: lastError,
        message: `Item ${index} failed after ${attempts} attempts`,
      })),
    )
  const concurrency = options.concurrency ?? Infinity
  // Each item returns a Result instead of rejecting, so mapAsync itself always succeeds.
  return collect(unwrapOr(await mapAsync(items, retryOne, { concurrency }), []))
}
