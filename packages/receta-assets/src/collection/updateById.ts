import * as R from 'remeda'
import { updateAt } from '@ontologyio/receta/collection'
import { by, eq } from '@ontologyio/receta/predicate'
import { fromNullable, map, type Result } from '@ontologyio/receta/result'

export type UpdateByIdError = {
  readonly code: 'NOT_FOUND'
  readonly id: string | number
  readonly message: string
}

/**
 * Applies a change to the item with an `id`, or says the id is missing instead of doing nothing.
 *
 * Use when: an edit targets one row and a missing row means the screen is stale, so the
 * caller should refetch or show an error rather than silently drop the edit. The updated item
 * keeps its position. Only the first item with the id is changed.
 *
 * @example
 * ```ts
 * const cart = [
 *   { id: 'mug', qty: 1 },
 *   { id: 'tee', qty: 2 },
 * ]
 *
 * updateById(cart, 'tee', (line) => ({ ...line, qty: line.qty + 1 }))
 * // => Ok([{ id: 'mug', qty: 1 }, { id: 'tee', qty: 3 }])
 *
 * R.pipe(cart, updateById('cap', (line) => ({ ...line, qty: 0 })))
 * // => Err({ code: 'NOT_FOUND', id: 'cap', message: 'No item has the id "cap"' })
 * ```
 *
 * @tags update, edit, patch, modify, replace, list, id, not found, stale
 * @see upsertById - adds the item when the id is missing instead of failing
 * @see updateAt - @ontologyio/receta/collection, the update by position
 */
export function updateById<T extends { readonly id: string | number }>(
  items: readonly T[],
  id: T['id'],
  update: (item: T) => T,
): Result<readonly T[], UpdateByIdError>
export function updateById<T extends { readonly id: string | number }>(
  id: T['id'],
  update: (item: T) => T,
): (items: readonly T[]) => Result<readonly T[], UpdateByIdError>
export function updateById(...args: unknown[]): unknown {
  return R.purry(updateByIdImplementation, args)
}

const updateByIdImplementation = <T extends { readonly id: string | number }>(
  items: readonly T[],
  id: T['id'],
  update: (item: T) => T,
): Result<readonly T[], UpdateByIdError> => {
  const index = R.findIndex(items, by((item: T) => item.id, eq(id)))
  const notFound: UpdateByIdError = { code: 'NOT_FOUND', id, message: `No item has the id "${id}"` }
  // A missing id gives -1, and items[-1] is undefined, so the lookup fails before updateAt runs.
  return R.pipe(
    fromNullable(items[index], notFound),
    map((item) => updateAt(items, index, update(item))),
  )
}
