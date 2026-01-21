import * as R from 'remeda'
import type { ConcurrencyOptions } from './types'
import { ok, err, isOk, type Result } from '../result'

/**
 * Maps over an array with an async function, with optional concurrency control.
 *
 * This is more powerful than Promise.all(items.map(fn)) because it allows
 * limiting concurrent operations, which is essential for rate limiting,
 * managing resources, and avoiding overwhelming APIs or databases.
 *
 * @param items - Array of items to map over
 * @param fn - Async function to apply to each item
 * @param options - Concurrency options
 * @returns Promise resolving to array of results
 *
 * @example
 * ```typescript
 * // Data-first: Fetch users with concurrency limit
 * const users = await mapAsync(
 *   ['user1', 'user2', 'user3'],
 *   async (id) => fetch(`/api/users/${id}`).then(r => r.json()),
 *   { concurrency: 2 }
 * )
 *
 * // Data-last (in pipe)
 * const result = await R.pipe(
 *   userIds,
 *   async (ids) => mapAsync(ids, fetchUser, { concurrency: 5 })
 * )
 *
 * // Unlimited concurrency (same as Promise.all)
 * const all = await mapAsync(urls, fetchJSON)
 * ```
 *
 * @see filterAsync - for filtering with async predicates
 * @see parallel - for running tasks in parallel with concurrency limit
 */
export function mapAsync<T, U>(
  items: readonly T[],
  fn: (item: T, index: number) => Promise<U>,
  options?: ConcurrencyOptions
): Promise<U[]>

export function mapAsync<T, U>(
  fn: (item: T, index: number) => Promise<U>,
  options?: ConcurrencyOptions
): (items: readonly T[]) => Promise<U[]>

export function mapAsync<T, U>(
  itemsOrFn: readonly T[] | ((item: T, index: number) => Promise<U>),
  fnOrOptions?: ((item: T, index: number) => Promise<U>) | ConcurrencyOptions,
  options?: ConcurrencyOptions
): Promise<U[]> | ((items: readonly T[]) => Promise<U[]>) {
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
): Promise<U[]> {
  const { concurrency = Infinity } = options ?? {}

  // Unlimited concurrency - just use Promise.all
  if (concurrency === Infinity || concurrency >= items.length) {
    return Promise.all(items.map(fn))
  }

  // Limited concurrency using a sliding window
  const results: U[] = new Array(items.length)
  const executing = new Set<Promise<void>>()
  let index = 0

  for (const [i, item] of items.entries()) {
    const promise = (async () => {
      results[i] = await fn(item, i)
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

    index++
  }

  // Wait for all remaining promises to complete
  await Promise.all(executing)

  return results
}

/**
 * Error type returned by mapAsyncResult when an item fails.
 */
export interface MapAsyncError<E> {
  readonly type: 'item_failed'
  readonly index: number
  readonly item: unknown
  readonly error: E
}

/**
 * Maps over an array with an async function returning Results, with concurrency control.
 *
 * Unlike `mapAsync()` which throws on first error, this collects all results
 * and returns either all successes or the first failure encountered.
 *
 * @param items - Array of items to map over
 * @param fn - Async function returning Result
 * @param options - Concurrency options
 * @returns Promise resolving to Result of array or first error
 *
 * @example
 * ```typescript
 * import * as R from 'remeda'
 * import { collect, unwrapOr } from 'receta/result'
 *
 * // Map with Result-returning function
 * const result = await mapAsyncResult(
 *   ['user1', 'user2', 'user3'],
 *   async (id) => fetchUserResult(id), // returns Result<User, FetchError>
 *   { concurrency: 2 }
 * )
 *
 * // Handle with Result pattern
 * const users = R.pipe(
 *   result,
 *   unwrapOr([])
 * )
 *
 * // Collect individual Results
 * const results = await mapAsync(
 *   userIds,
 *   async (id) => fetchUserResult(id)
 * )
 * const allOrNone = collect(results) // Result<User[], FetchError>
 * ```
 *
 * @see mapAsync - for the throwing version
 * @see Result.collect - for combining multiple Results
 */
export async function mapAsyncResult<T, U, E>(
  items: readonly T[],
  fn: (item: T, index: number) => Promise<Result<U, E>>,
  options?: ConcurrencyOptions
): Promise<Result<U[], MapAsyncError<E>>> {
  const { concurrency = Infinity } = options ?? {}

  const results: Result<U, E>[] = []

  // Unlimited concurrency
  if (concurrency === Infinity || concurrency >= items.length) {
    const promises = items.map((item, i) => fn(item, i))
    results.push(...(await Promise.all(promises)))
  } else {
    // Limited concurrency using a sliding window
    const executing = new Set<Promise<void>>()

    for (const [i, item] of items.entries()) {
      const promise = (async () => {
        const result = await fn(item, i)
        results[i] = result
      })()

      const tracked = promise.then(() => {
        executing.delete(tracked)
      })

      executing.add(tracked)

      if (executing.size >= concurrency) {
        await Promise.race(executing)
      }
    }

    await Promise.all(executing)
  }

  // Check if any failed and return first error
  for (const [index, result] of results.entries()) {
    if (!isOk(result)) {
      return err({
        type: 'item_failed' as const,
        index,
        item: items[index],
        error: result.error,
      })
    }
  }

  // All succeeded
  return ok(results.map((r) => (r as { value: U }).value))
}
