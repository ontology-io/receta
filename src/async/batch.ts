import * as R from 'remeda'
import type { BatchOptions } from './types'
import { sleep } from './retry'
import { mapAsync } from './mapAsync'

/**
 * Processes items in batches with optional delay between batches.
 *
 * Useful for bulk operations like data imports, exports, or processing
 * large datasets without overwhelming the system.
 *
 * @param items - Array of items to process
 * @param fn - Async function to apply to each batch
 * @param options - Batch options
 * @returns Promise resolving to array of all results
 *
 * @example
 * ```typescript
 * // Process users in batches of 50
 * const results = await batch(
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
 * // Send emails in batches to avoid rate limits
 * await batch(
 *   emailAddresses,
 *   async (batch) => sendBulkEmail(batch),
 *   {
 *     batchSize: 100,
 *     delayBetweenBatches: 5000, // 5 seconds between batches
 *     concurrency: 2, // Process 2 batches concurrently
 *   }
 * )
 *
 * // Import large dataset
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
 */
export async function batch<T, U>(
  items: readonly T[],
  fn: (batch: readonly T[]) => Promise<U>,
  options: BatchOptions = {}
): Promise<U[]> {
  const {
    batchSize = 10,
    delayBetweenBatches = 0,
    concurrency = 1,
  } = options

  // Split items into batches using Remeda's chunk utility
  const batches = R.chunk(items, batchSize)

  // Process batches
  const results: U[] = []

  if (delayBetweenBatches > 0) {
    // Sequential processing with delay
    for (const [index, currentBatch] of batches.entries()) {
      const result = await fn(currentBatch)
      results.push(result)

      // Don't delay after the last batch
      if (index < batches.length - 1) {
        await sleep(delayBetweenBatches)
      }
    }
  } else {
    // Parallel processing with concurrency limit
    const batchResults = await mapAsync(
      batches,
      (currentBatch) => fn(currentBatch),
      { concurrency }
    )
    results.push(...batchResults)
  }

  return results
}

