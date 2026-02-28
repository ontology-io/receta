import type { ConcurrencyOptions } from '../types'
import { ok, err, type Result, orThrow } from '../../result'

/**
 * Error type for mapAsync failures.
 */
export interface MapAsyncError {
  readonly type: 'map_async_error'
  readonly index: number
  readonly item: unknown
  readonly error: unknown
}

/**
 * Maps over an array with an async function, with optional concurrency control.
 *
 * Returns a Result to handle errors explicitly. If any mapper function fails,
 * the entire operation returns an Err with details about the failure.
 *
 * This is more powerful than Promise.all(items.map(fn)) because it:
 * - Allows limiting concurrent operations (rate limiting, resource management)
 * - Returns Result for explicit error handling
 * - Provides detailed error information (which item failed)
 *
 * @param items - Array of items to map over
 * @param fn - Async function to apply to each item
 * @param options - Concurrency options
 * @returns Promise resolving to Result containing array of results or error
 *
 * @example
 * ```typescript
 * import * as R from 'remeda'
 * import { unwrapOr, mapErr } from 'receta/result'
 *
 * // Data-first: Fetch users with concurrency limit
 * const result = await mapAsync(
 *   ['user1', 'user2', 'user3'],
 *   async (id) => fetch(`/api/users/${id}`).then(r => r.json()),
 *   { concurrency: 2 }
 * )
 *
 * // Handle with Result pattern
 * const users = R.pipe(
 *   result,
 *   mapErr(error => console.error('Failed at index:', error.index)),
 *   unwrapOr([])
 * )
 *
 * // Data-last (in pipe)
 * const processed = await R.pipe(
 *   userIds,
 *   async (ids) => mapAsync(ids, fetchUser, { concurrency: 5 }),
 *   async (result) => unwrapOr(result, [])
 * )
 *
 * // Unlimited concurrency (same as Promise.all but safer)
 * const all = await mapAsync(urls, fetchJSON)
 * ```
 *
 * @see filterAsync - for filtering with async predicates
 * @see parallel - for running tasks in parallel with concurrency limit
 * @see mapAsyncOrThrow - throwing variant for backward compatibility
 */
export function mapAsync<T, U>(
  items: readonly T[],
  fn: (item: T, index: number) => Promise<U>,
  options?: ConcurrencyOptions
): Promise<Result<U[], MapAsyncError>>

export function mapAsync<T, U>(
  fn: (item: T, index: number) => Promise<U>,
  options?: ConcurrencyOptions
): (items: readonly T[]) => Promise<Result<U[], MapAsyncError>>

export function mapAsync<T, U>(
  itemsOrFn: readonly T[] | ((item: T, index: number) => Promise<U>),
  fnOrOptions?: ((item: T, index: number) => Promise<U>) | ConcurrencyOptions,
  options?: ConcurrencyOptions
): Promise<Result<U[], MapAsyncError>> | ((items: readonly T[]) => Promise<Result<U[], MapAsyncError>>) {
  // Data-last
  if (typeof itemsOrFn === 'function') {
    return (items: readonly T[]) =>
      mapAsyncImplementation(items, itemsOrFn, fnOrOptions as ConcurrencyOptions | undefined)
  }

  // Data-first
  return mapAsyncImplementation(
    itemsOrFn,
    fnOrOptions as (item: T, index: number) => Promise<U>,
    options
  )
}

async function mapAsyncImplementation<T, U>(
  items: readonly T[],
  fn: (item: T, index: number) => Promise<U>,
  options?: ConcurrencyOptions
): Promise<Result<U[], MapAsyncError>> {
  const { concurrency = Infinity } = options ?? {}

  // Unlimited concurrency - use Promise.all with Result wrapping
  if (concurrency === Infinity || concurrency >= items.length) {
    try {
      const results = await Promise.all(items.map(fn))
      return ok(results)
    } catch (error) {
      // Find which item failed (best effort)
      return err({
        type: 'map_async_error' as const,
        index: -1, // Unknown in Promise.all
        item: undefined,
        error,
      })
    }
  }

  // Limited concurrency using a sliding window with error tracking
  const results: U[] = new Array(items.length)
  const executing = new Set<Promise<void>>()
  let firstError: MapAsyncError | null = null

  for (const [i, item] of items.entries()) {
    // Stop starting new work if we've encountered an error
    if (firstError) break

    const promise = (async () => {
      try {
        results[i] = await fn(item, i)
      } catch (error) {
        // Capture first error with context
        if (!firstError) {
          firstError = {
            type: 'map_async_error' as const,
            index: i,
            item,
            error,
          }
        }
      }
    })()

    // Wrap in a void promise that removes itself when done
    const tracked = promise.then(() => {
      executing.delete(tracked)
    })

    executing.add(tracked)

    // If we've hit the concurrency limit, wait for one to complete
    if (executing.size >= concurrency) {
      await Promise.race(executing)
    }
  }

  // Wait for all remaining promises to complete
  await Promise.all(executing)

  // Return error if any occurred
  if (firstError) {
    return err(firstError)
  }

  return ok(results)
}

/**
 * Throwing variant of mapAsync for backward compatibility.
 *
 * Use this when you want exceptions instead of Result pattern.
 * Prefer the Result-returning mapAsync for better error handling.
 *
 * This is implemented using the `orThrow` utility from Result module,
 * which converts any Result-returning function to a throwing variant.
 *
 * @param items - Array of items to map over
 * @param fn - Async function to apply to each item
 * @param options - Concurrency options
 * @returns Promise resolving to array of results
 * @throws MapAsyncError if any mapper function fails
 *
 * @example
 * ```typescript
 * // Throws on error
 * try {
 *   const users = await mapAsyncOrThrow(
 *     userIds,
 *     async (id) => fetchUser(id),
 *     { concurrency: 5 }
 *   )
 * } catch (error) {
 *   console.error('Failed:', error)
 * }
 *
 * // Equivalent to using orThrow directly
 * const mapAsyncOrThrow = orThrow(mapAsync)
 * ```
 *
 * @see mapAsync - Result-returning variant (recommended)
 * @see orThrow - utility for creating throwing variants
 */
export const mapAsyncOrThrow = orThrow(mapAsync)

