import * as R from 'remeda'
import type { ConcurrencyOptions } from './types'

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
