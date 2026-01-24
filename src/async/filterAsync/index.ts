import * as R from 'remeda'
import type { ConcurrencyOptions } from '../types'
import { mapAsync, type MapAsyncError } from '../mapAsync'
import { type Result, ok, err, orThrow, map as resultMap, mapErr } from '../../result'

/**
 * Error type for filterAsync failures.
 */
export interface FilterAsyncError {
  readonly type: 'filter_async_error'
  readonly underlyingError: MapAsyncError
}

/**
 * Filters an array using an async predicate function.
 *
 * Returns a Result to handle errors explicitly. If any predicate evaluation fails,
 * the entire operation returns an Err with details about the failure.
 *
 * @param items - Array of items to filter
 * @param predicate - Async function that returns true to keep the item
 * @param options - Concurrency options
 * @returns Promise resolving to Result containing filtered array or error
 *
 * @example
 * ```typescript
 * import * as R from 'remeda'
 * import { unwrapOr, mapErr } from 'receta/result'
 *
 * // Data-first: Filter users who exist
 * const result = await filterAsync(
 *   userIds,
 *   async (id) => {
 *     const res = await fetch(`/api/users/${id}`)
 *     return res.ok
 *   },
 *   { concurrency: 5 }
 * )
 *
 * // Handle with Result pattern
 * const existingUsers = R.pipe(
 *   result,
 *   mapErr(error => console.error('Filter failed:', error)),
 *   unwrapOr([])
 * )
 *
 * // Data-last (in pipe)
 * const filtered = await R.pipe(
 *   urls,
 *   async (items) => filterAsync(items, isValid, { concurrency: 3 }),
 *   async (result) => unwrapOr(result, [])
 * )
 * ```
 *
 * @see mapAsync - for transforming with async functions
 * @see filterAsyncOrThrow - throwing variant for backward compatibility
 */
export function filterAsync<T>(
  items: readonly T[],
  predicate: (item: T, index: number) => Promise<boolean>,
  options?: ConcurrencyOptions
): Promise<Result<T[], FilterAsyncError>>

export function filterAsync<T>(
  predicate: (item: T, index: number) => Promise<boolean>,
  options?: ConcurrencyOptions
): (items: readonly T[]) => Promise<Result<T[], FilterAsyncError>>

export function filterAsync<T>(
  itemsOrPredicate: readonly T[] | ((item: T, index: number) => Promise<boolean>),
  predicateOrOptions?: ((item: T, index: number) => Promise<boolean>) | ConcurrencyOptions,
  options?: ConcurrencyOptions
): Promise<Result<T[], FilterAsyncError>> | ((items: readonly T[]) => Promise<Result<T[], FilterAsyncError>>) {
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
): Promise<Result<T[], FilterAsyncError>> {
  // Map each item to a tuple of [item, shouldKeep]
  const mapResult = await mapAsync(
    items,
    async (item, index) => {
      const shouldKeep = await predicate(item, index)
      return [item, shouldKeep] as const
    },
    options
  )

  // Convert MapAsyncError to FilterAsyncError and process results
  return R.pipe(
    mapResult,
    resultMap((results) =>
      R.pipe(
        results,
        R.filter(([, shouldKeep]) => shouldKeep),
        R.map(([item]) => item)
      )
    ),
    mapErr((mapError): FilterAsyncError => ({
      type: 'filter_async_error' as const,
      underlyingError: mapError,
    }))
  )
}

/**
 * Throwing variant of filterAsync for backward compatibility.
 *
 * Use this when you want exceptions instead of Result pattern.
 * Prefer the Result-returning filterAsync for better error handling.
 *
 * @param items - Array of items to filter
 * @param predicate - Async function that returns true to keep the item
 * @param options - Concurrency options
 * @returns Promise resolving to filtered array
 * @throws FilterAsyncError if any predicate evaluation fails
 *
 * @example
 * ```typescript
 * // Throws on error
 * try {
 *   const existingUsers = await filterAsyncOrThrow(
 *     userIds,
 *     async (id) => {
 *       const res = await fetch(`/api/users/${id}`)
 *       return res.ok
 *     },
 *     { concurrency: 5 }
 *   )
 * } catch (error) {
 *   console.error('Filter failed:', error)
 * }
 * ```
 *
 * @see filterAsync - Result-returning variant (recommended)
 * @see orThrow - utility for creating throwing variants
 */
export const filterAsyncOrThrow = orThrow(filterAsync)
