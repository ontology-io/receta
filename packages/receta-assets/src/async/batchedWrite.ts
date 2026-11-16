import * as R from 'remeda'
import { sequential, sleep } from '@ontologyio/receta/async'
import { mapErr, type Result } from '@ontologyio/receta/result'

export type BatchedWriteOptions = {
  /** Items per call to `write`, at least 1. The last batch can be smaller. */
  readonly batchSize: number
  /** Wait between one batch finishing and the next starting. Defaults to 0. */
  readonly pauseMs?: number
}

export type BatchedWriteError = {
  readonly code: 'BATCH_FAILED'
  /** Which batch failed, counting from 0. */
  readonly batchIndex: number
  /** How many items the batches before it wrote, so a rerun can skip them. */
  readonly written: number
  readonly error: unknown
  readonly message: string
}

/**
 * Splits items into batches and writes them one batch at a time, stopping at the first batch that fails.
 *
 * Use when: a bulk insert or import goes through an API or database with a limit per
 * request, such as 100 rows per call, and a rate limit between calls. Batches run in order,
 * never at once. On failure, `written` says how many items are already stored, so the job
 * can resume with `items.slice(written)` instead of starting over.
 *
 * @example
 * ```ts
 * const insert = async (rows: readonly number[]) => rows.length
 *
 * await batchedWrite([1, 2, 3, 4, 5], insert, { batchSize: 2, pauseMs: 1 })
 * // => Ok([2, 2, 1])
 *
 * const insertUntilFull = async (rows: readonly number[]) =>
 *   rows.includes(5) ? Promise.reject('disk full') : rows.length
 *
 * await batchedWrite([1, 2, 3, 4, 5], insertUntilFull, { batchSize: 2 })
 * // => Err({ code: 'BATCH_FAILED', batchIndex: 2, written: 4, error: 'disk full', message: 'Batch 2 failed after 4 items were written' })
 * ```
 *
 * @tags batch, chunk, bulk insert, import, rate limit, resume, sequential, write
 * @see sequential - @ontologyio/receta/async, runs the batches in order and says which one failed
 * @see batch - @ontologyio/receta/async, can run batches at once, but loses the failed batch's index when it pauses
 */
export async function batchedWrite<T, U>(
  items: readonly T[],
  write: (batch: readonly T[]) => Promise<U>,
  options: BatchedWriteOptions,
): Promise<Result<U[], BatchedWriteError>> {
  const pauseMs = options.pauseMs ?? 0
  const writes = R.map(R.chunk(items, options.batchSize), (batch, index) => async () => {
    if (index > 0) await sleep(pauseMs)
    return write(batch)
  })
  return R.pipe(
    await sequential(writes),
    mapErr(({ taskIndex, completedTasks, error }): BatchedWriteError => {
      // Only the last batch can be short, so every batch before the failed one was full.
      const written = completedTasks * options.batchSize
      return {
        code: 'BATCH_FAILED',
        batchIndex: taskIndex,
        written,
        error,
        message: `Batch ${taskIndex} failed after ${written} items were written`,
      }
    }),
  )
}
