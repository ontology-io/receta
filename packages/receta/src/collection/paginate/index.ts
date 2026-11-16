import * as R from 'remeda'
import type {
  PaginationConfig,
  PaginatedResult,
  CursorPaginationConfig,
  CursorPaginatedResult,
} from '../types'

/**
 * Paginates an array using offset-based pagination.
 *
 * Useful for implementing API pagination, infinite scroll, and data tables.
 *
 * @param items - The array to paginate
 * @param config - Pagination configuration (page and pageSize)
 * @returns A PaginatedResult with items and metadata
 *
 * @example
 * ```typescript
 * // Data-first
 * const users = R.times(100, i => ({ id: i }))
 *
 * paginate(users, { page: 1, pageSize: 20 })
 * // => {
 * //   items: [first 20 users],
 * //   page: 1,
 * //   pageSize: 20,
 * //   total: 100,
 * //   hasNext: true,
 * //   hasPrevious: false
 * // }
 *
 * // Data-last (in pipe)
 * pipe(
 *   users,
 *   paginate({ page: 2, pageSize: 20 })
 * )
 * ```
 *
 * @see paginateCursor - for cursor-based pagination
 */
export function paginate<T>(
  items: readonly T[],
  config: PaginationConfig
): PaginatedResult<T>
export function paginate<T>(
  config: PaginationConfig
): (items: readonly T[]) => PaginatedResult<T>
export function paginate(...args: unknown[]): unknown {
  return R.purry(paginateImplementation, args)
}

function paginateImplementation<T>(
  items: readonly T[],
  config: PaginationConfig
): PaginatedResult<T> {
  const { page, pageSize } = config
  const total = items.length
  const start = (page - 1) * pageSize
  const end = start + pageSize

  const pageItems = R.pipe(items, R.drop(start), R.take(pageSize))

  return {
    items: pageItems,
    page,
    pageSize,
    total,
    hasNext: end < total,
    hasPrevious: page > 1,
  }
}

/**
 * Paginates an array using cursor-based pagination.
 *
 * More efficient than offset pagination for large datasets and real-time data.
 * Prevents issues with missing/duplicate items during pagination.
 *
 * A cursor that isn't in the list, for example because its item was deleted, gives an
 * empty page with `hasMore: false`. Leave the cursor out to start from the first page.
 *
 * @param items - The array to paginate
 * @param getCursor - Function to extract cursor from item
 * @param config - Cursor pagination configuration
 * @returns A CursorPaginatedResult with items and next cursor
 *
 * @example
 * ```typescript
 * // Data-first
 * const messages = R.times(25, i => ({ id: `msg_${i + 1}` }))
 *
 * paginateCursor(messages, (m) => m.id, { limit: 10 })
 * // => {
 * //   items: [first 10 messages],
 * //   nextCursor: 'msg_10',
 * //   hasMore: true
 * // }
 *
 * // Continue from cursor
 * paginateCursor(messages, (m) => m.id, { cursor: 'msg_10', limit: 10 })
 *
 * // A cursor that is no longer in the list ends the paging
 * paginateCursor(messages, (m) => m.id, { cursor: 'msg_deleted', limit: 10 })
 * // => { items: [], nextCursor: undefined, hasMore: false }
 *
 * // Data-last (in pipe)
 * pipe(
 *   messages,
 *   paginateCursor((m) => m.id, { limit: 10 })
 * )
 * ```
 *
 * @see paginate - for offset-based pagination
 */
export function paginateCursor<T, TCursor>(
  items: readonly T[],
  getCursor: (item: T) => TCursor,
  config: CursorPaginationConfig<TCursor>
): CursorPaginatedResult<T, TCursor>
export function paginateCursor<T, TCursor>(
  getCursor: (item: T) => TCursor,
  config: CursorPaginationConfig<TCursor>
): (items: readonly T[]) => CursorPaginatedResult<T, TCursor>
export function paginateCursor(...args: unknown[]): unknown {
  return R.purry(paginateCursorImplementation, args)
}

function paginateCursorImplementation<T, TCursor>(
  items: readonly T[],
  getCursor: (item: T) => TCursor,
  config: CursorPaginationConfig<TCursor>
): CursorPaginatedResult<T, TCursor> {
  const { cursor, limit } = config

  const cursorIndex =
    cursor === undefined ? -1 : R.findIndex(items, (item) => getCursor(item) === cursor)

  // The cursor names an item that isn't here any more. Starting over would hand the caller
  // the first page again, so this is the end of the list for them.
  if (cursor !== undefined && cursorIndex === -1) {
    return { items: [], nextCursor: undefined, hasMore: false }
  }

  // Start after the cursor, or at the beginning when there is none
  const startIndex = cursorIndex + 1

  const pageItems = R.pipe(items, R.drop(startIndex), R.take(limit))
  const endIndex = startIndex + pageItems.length
  const hasMore = endIndex < items.length

  // nextCursor is undefined if this is the last page
  // Otherwise it's the cursor of the last item (for continuing pagination)
  const lastItem = R.last(pageItems)
  const nextCursor = hasMore && lastItem !== undefined
    ? getCursor(lastItem)
    : undefined

  return {
    items: pageItems,
    nextCursor,
    hasMore,
  }
}
