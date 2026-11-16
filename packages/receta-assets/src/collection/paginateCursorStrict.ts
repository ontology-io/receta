import * as R from 'remeda'
import { paginateCursor, type CursorPaginatedResult } from '@ontologyio/receta/collection'
import { by, eq } from '@ontologyio/receta/predicate'
import { err, ok, type Result } from '@ontologyio/receta/result'

export type PaginateCursorStrictOptions<C> = {
  /** The cursor of the last item already shown. Leave it out, or pass `undefined`, for the first page. */
  readonly cursor?: C | undefined
  readonly limit: number
}

export type PaginateCursorStrictError<C> = {
  readonly code: 'UNKNOWN_CURSOR'
  readonly cursor: C
  readonly message: string
}

/**
 * Returns the page after a cursor, and fails when the cursor matches no item instead of starting over.
 *
 * Use when: serving "load more" or infinite scroll from a list, where a cursor can go stale
 * because its item was deleted. Receta's `paginateCursor` quietly returns the first page for an
 * unknown cursor, which shows the user the same items again; this returns an error to answer
 * with a 400 or a reload. Cursors compare with `===`, so use strings or numbers.
 *
 * @example
 * ```ts
 * const messages = [{ id: 'm1' }, { id: 'm2' }, { id: 'm3' }]
 *
 * paginateCursorStrict(messages, (message) => message.id, { cursor: 'm1', limit: 1 })
 * // => Ok({ items: [{ id: 'm2' }], nextCursor: 'm2', hasMore: true })
 *
 * R.pipe(messages, paginateCursorStrict((message) => message.id, { cursor: undefined, limit: 2 }))
 * // => Ok({ items: [{ id: 'm1' }, { id: 'm2' }], nextCursor: 'm2', hasMore: true })
 *
 * paginateCursorStrict(messages, (message) => message.id, { cursor: 'm9', limit: 1 })
 * // => Err({ code: 'UNKNOWN_CURSOR', cursor: 'm9', message: 'No item has the cursor "m9"' })
 * ```
 *
 * @tags cursor, pagination, load more, infinite scroll, keyset, stale cursor, feed, next page
 * @see paginateCursor - @ontologyio/receta/collection, the page cut, which restarts on an unknown cursor
 * @see paginateClamped - numbered pages instead of cursors
 */
export function paginateCursorStrict<T, C extends string | number>(
  items: readonly T[],
  getCursor: (item: T) => C,
  options: PaginateCursorStrictOptions<NoInfer<C>>,
): Result<CursorPaginatedResult<T, C>, PaginateCursorStrictError<C>>
export function paginateCursorStrict<T, C extends string | number>(
  getCursor: (item: T) => C,
  options: PaginateCursorStrictOptions<NoInfer<C>>,
): (items: readonly T[]) => Result<CursorPaginatedResult<T, C>, PaginateCursorStrictError<C>>
export function paginateCursorStrict(...args: unknown[]): unknown {
  return R.purry(paginateCursorStrictImplementation, args)
}

const paginateCursorStrictImplementation = <T, C extends string | number>(
  items: readonly T[],
  getCursor: (item: T) => C,
  { cursor, limit }: PaginateCursorStrictOptions<C>,
): Result<CursorPaginatedResult<T, C>, PaginateCursorStrictError<C>> => {
  if (cursor === undefined) return ok(paginateCursor(items, getCursor, { limit }))
  return items.some(by(getCursor, eq(cursor)))
    ? ok(paginateCursor(items, getCursor, { cursor, limit }))
    : err({ code: 'UNKNOWN_CURSOR', cursor, message: `No item has the cursor "${cursor}"` })
}
