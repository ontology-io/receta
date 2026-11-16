import * as R from 'remeda'
import { moveIndex } from '@ontologyio/receta/collection'
import { clamp } from '@ontologyio/receta/number'
import { by, eq } from '@ontologyio/receta/predicate'
import { fromNullable, map, type Result } from '@ontologyio/receta/result'

export type MoveItemByIdError = {
  readonly code: 'NOT_FOUND'
  readonly id: string | number
  readonly message: string
}

/**
 * Moves the item with an `id` to a new position, as a drag and drop reorder does.
 *
 * Use when: a user drags a card, a playlist track or a menu entry and drops it at a position.
 * `toIndex` is where the item ends up. A drop past either end lands at that end, so `-5`
 * means first and `99` means last. A missing id is an error, since the list the user saw is
 * no longer the list being changed.
 *
 * @example
 * ```ts
 * import { map } from '@ontologyio/receta/result'
 *
 * const tracks = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }]
 *
 * R.pipe(moveItemById(tracks, 'a', 2), map(R.map(R.prop('id'))))
 * // => Ok(['b', 'c', 'a', 'd'])
 *
 * R.pipe(tracks, moveItemById('b', 99), map(R.map(R.prop('id'))))
 * // => Ok(['a', 'c', 'd', 'b'])
 *
 * moveItemById(tracks, 'x', 0)
 * // => Err({ code: 'NOT_FOUND', id: 'x', message: 'No item has the id "x"' })
 * ```
 *
 * @tags move, reorder, drag and drop, sortable, rearrange, position, list, id
 * @see moveIndex - @ontologyio/receta/collection, the move by position, which ignores out-of-range drops
 */
export function moveItemById<T extends { readonly id: string | number }>(
  items: readonly T[],
  id: T['id'],
  toIndex: number,
): Result<readonly T[], MoveItemByIdError>
export function moveItemById<T extends { readonly id: string | number }>(
  id: T['id'],
  toIndex: number,
): (items: readonly T[]) => Result<readonly T[], MoveItemByIdError>
export function moveItemById(...args: unknown[]): unknown {
  return R.purry(moveItemByIdImplementation, args)
}

const moveItemByIdImplementation = <T extends { readonly id: string | number }>(
  items: readonly T[],
  id: T['id'],
  toIndex: number,
): Result<readonly T[], MoveItemByIdError> => {
  const fromIndex = R.findIndex(items, by((item: T) => item.id, eq(id)))
  const notFound: MoveItemByIdError = { code: 'NOT_FOUND', id, message: `No item has the id "${id}"` }
  // A missing id gives -1, and items[-1] is undefined, so the lookup fails before moveIndex runs.
  return R.pipe(
    fromNullable(items[fromIndex], notFound),
    map(() => moveIndex(items, fromIndex, clamp(toIndex, 0, items.length - 1))),
  )
}
