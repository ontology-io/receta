import * as R from 'remeda'
import type { ConcurrencyOptions } from './types'
import { mapAsync } from './mapAsync'

/**
 * Filters an array using an async predicate function.
 *
 * @param items - Array of items to filter
 * @param predicate - Async function that returns true to keep the item
 * @param options - Concurrency options
 * @returns Promise resolving to filtered array
 *
 * @example
 * ```typescript
 * // Data-first: Filter users who exist
 * const existingUsers = await filterAsync(
 *   userIds,
 *   async (id) => {
 *     const res = await fetch(`/api/users/${id}`)
 *     return res.ok
 *   },
 *   { concurrency: 5 }
 * )
 *
 * // Data-last (in pipe)
 * const result = await R.pipe(
 *   urls,
 *   async (items) => filterAsync(items, isValid, { concurrency: 3 })
 * )
 * ```
 *
 * @see mapAsync - for transforming with async functions
 */
export function filterAsync<T>(
  items: readonly T[],
  predicate: (item: T, index: number) => Promise<boolean>,
  options?: ConcurrencyOptions
): Promise<T[]>

export function filterAsync<T>(
  predicate: (item: T, index: number) => Promise<boolean>,
  options?: ConcurrencyOptions
): (items: readonly T[]) => Promise<T[]>

export function filterAsync<T>(
  itemsOrPredicate: readonly T[] | ((item: T, index: number) => Promise<boolean>),
  predicateOrOptions?: ((item: T, index: number) => Promise<boolean>) | ConcurrencyOptions,
  options?: ConcurrencyOptions
): Promise<T[]> | ((items: readonly T[]) => Promise<T[]>) {
  // Data-last
  if (typeof itemsOrPredicate === 'function') {
    return (items: readonly T[]) =>
      filterAsyncImplementation(items, itemsOrPredicate, predicateOrOptions as ConcurrencyOptions | undefined)
  }

  // Data-first
  return filterAsyncImplementation(
    itemsOrPredicate,
    predicateOrOptions as (item: T, index: number) => Promise<boolean>,
    options
  )
}

async function filterAsyncImplementation<T>(
  items: readonly T[],
  predicate: (item: T, index: number) => Promise<boolean>,
  options?: ConcurrencyOptions
): Promise<T[]> {
  // Map each item to a tuple of [item, shouldKeep]
  const results = await mapAsync(
    items,
    async (item, index) => {
      const shouldKeep = await predicate(item, index)
      return [item, shouldKeep] as const
    },
    options
  )

  // Filter to only items where shouldKeep is true using Remeda's pipe
  return R.pipe(
    results,
    R.filter(([, shouldKeep]) => shouldKeep),
    R.map(([item]) => item)
  )
}
