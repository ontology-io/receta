import * as R from 'remeda'
import type { BatchOptions } from '../types'
import { sleep } from '../retry'
import { mapAsync, type MapAsyncError } from '../mapAsync'
import { ok, err, type Result, orThrow, map as resultMap, mapErr } from '../../result'

/**
 * Error type for batch processing failures.
 */
export interface BatchError {
  readonly type: 'batch_error'
  readonly batchIndex: number
  readonly itemsInBatch: number
  readonly underlyingError: MapAsyncError | unknown
}

/**
 * Processes items in batches with optional delay between batches.
 *
 * Returns a Result to handle errors explicitly. If any batch processing fails,
 * the entire operation returns an Err with details about which batch failed.
 *
 * Useful for bulk operations like data imports, exports, or processing
 * large datasets without overwhelming the system.
 *
 * @param items - Array of items to process
 * @param fn - Async function to apply to each batch
 * @param options - Batch options
 * @returns Promise resolving to Result containing array of all results or error
 *
 * @example
 * ```typescript
 * import * as R from 'remeda'
 * import { unwrapOr, mapErr } from 'receta/result'
 *
 * // Process users in batches of 50
 * const result = await batch(
 *   users,
 *   async (userBatch) => {
 *     return db.users.insertMany(userBatch)
 *   },
 *   {
 *     batchSize: 50,
 *     delayBetweenBatches: 1000, // 1 second between batches
 *   }
 * )
 *
 * // Handle with Result pattern
 * const inserted = R.pipe(
 *   result,
 *   mapErr(error => console.error('Batch failed:', error)),
 *   unwrapOr([])
 * )
 *
 * // Send emails in batches to avoid rate limits
 * const emailResult = await batch(
 *   emailAddresses,
 *   async (batch) => sendBulkEmail(batch),
 *   {
 *     batchSize: 100,
 *     delayBetweenBatches: 5000, // 5 seconds between batches
 *     concurrency: 2, // Process 2 batches concurrently
 *   }
 * )
 *
 * // Import large dataset with error handling
 * const imported = await batch(
 *   records,
 *   async (recordBatch) => {
 *     console.log(`Importing batch of ${recordBatch.length}`)
 *     return importRecords(recordBatch)
 *   },
 *   { batchSize: 1000 }
 * )
 * ```
 *
 * @see mapAsync - for mapping over items with concurrency
 * @see parallel - for running tasks in parallel
 * @see batchOrThrow - throwing variant for backward compatibility
 */
export async function batch<T, U>(
  items: readonly T[],
  fn: (batch: readonly T[]) => Promise<U>,
  options: BatchOptions = {}
): Promise<Result<U[], BatchError>> {
  const {
    batchSize = 10,
    delayBetweenBatches = 0,
    concurrency = 1,
  } = options

  const batches = R.chunk(items, batchSize)

  // Process batches with optional delay using functional composition
  if (delayBetweenBatches > 0) {
    // Sequential processing with delay between batches
    try {
      const results = await R.reduce(
        batches,
        async (acc, currentBatch, index) => {
          const results = await acc
          const result = await fn(currentBatch)

          // Don't delay after the last batch
          if (index < batches.length - 1) {
            await sleep(delayBetweenBatches)
          }

          return [...results, result]
        },
        Promise.resolve([] as U[])
      )
      return ok(results)
    } catch (error) {
      return err({
        type: 'batch_error' as const,
        batchIndex: -1, // Unknown in sequential reduce with delay
        itemsInBatch: batchSize,
        underlyingError: error,
      })
    }
  }

  // Parallel processing with concurrency limit
  const mapResult = await mapAsync(batches, fn, { concurrency })

  // Convert MapAsyncError to BatchError with more context
  return R.pipe(
    mapResult,
    mapErr((mapError): BatchError => ({
      type: 'batch_error' as const,
      batchIndex: mapError.index,
      itemsInBatch: batches[mapError.index]?.length ?? 0,
      underlyingError: mapError,
    }))
  )
}

/**
 * Throwing variant of batch for backward compatibility.
 *
 * Use this when you want exceptions instead of Result pattern.
 * Prefer the Result-returning batch for better error handling.
 *
 * @param items - Array of items to process
 * @param fn - Async function to apply to each batch
 * @param options - Batch options
 * @returns Promise resolving to array of all results
 * @throws BatchError if any batch processing fails
 *
 * @example
 * ```typescript
 * // Throws on error
 * try {
 *   const results = await batchOrThrow(
 *     users,
 *     async (userBatch) => db.users.insertMany(userBatch),
 *     { batchSize: 50 }
 *   )
 * } catch (error) {
 *   console.error('Batch failed:', error)
 * }
 * ```
 *
 * @see batch - Result-returning variant (recommended)
 * @see orThrow - utility for creating throwing variants
 */
export const batchOrThrow = orThrow(batch)

