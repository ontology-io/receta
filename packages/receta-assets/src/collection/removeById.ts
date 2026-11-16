import * as R from 'remeda'
import { removeAtIndex } from '@ontologyio/receta/collection'
import { fromNullable, isSome, type Option } from '@ontologyio/receta/option'
import { by, eq } from '@ontologyio/receta/predicate'

export type RemoveByIdResult<T> = {
  /** The list without the item, or the same list when no item had the id. */
  readonly items: readonly T[]
  /** The item that was taken out, to put back if the server says no. */
  readonly removed: Option<T>
}

/**
 * Removes the item with an `id` and hands it back, so an optimistic delete can be undone.
 *
 * Use when: deleting a row in the UI before the server confirms. Keep `removed` and put it
 * back with `insertAt` if the request fails. A missing id leaves the list as it was and gives
 * `None`, never removing another item. Only the first item with the id is removed.
 *
 * @example
 * ```ts
 * const files = [
 *   { id: 'a', name: 'notes.md' },
 *   { id: 'b', name: 'draft.md' },
 * ]
 *
 * removeById(files, 'a')
 * // => { items: [{ id: 'b', name: 'draft.md' }], removed: Some({ id: 'a', name: 'notes.md' }) }
 *
 * R.pipe(files, removeById('zzz'))
 * // => { items: [{ id: 'a', name: 'notes.md' }, { id: 'b', name: 'draft.md' }], removed: None }
 * ```
 *
 * @tags remove, delete, optimistic, undo, rollback, list, id, splice
 * @see removeAtIndex - @ontologyio/receta/collection, the removal by position
 * @see upsertById - adds or replaces an item by id
 */
export function removeById<T extends { readonly id: string | number }>(
  items: readonly T[],
  id: T['id'],
): RemoveByIdResult<T>
export function removeById<T extends { readonly id: string | number }>(
  id: T['id'],
): (items: readonly T[]) => RemoveByIdResult<T>
export function removeById(...args: unknown[]): unknown {
  return R.purry(removeByIdImplementation, args)
}

const removeByIdImplementation = <T extends { readonly id: string | number }>(
  items: readonly T[],
  id: T['id'],
): RemoveByIdResult<T> => {
  const index = R.findIndex(items, by((item: T) => item.id, eq(id)))
  // A missing id gives -1, and items[-1] is undefined, so removed is None.
  const removed = fromNullable(items[index])
  // removeAtIndex reads -1 as the last item, so it only runs when the id was found.
  return { items: isSome(removed) ? removeAtIndex(items, index) : items, removed }
}
