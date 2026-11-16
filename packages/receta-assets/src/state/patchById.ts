import * as R from 'remeda'
import { index, optional, over } from '@ontologyio/receta/lens'
import { map } from '@ontologyio/receta/option'
import { eq, prop } from '@ontologyio/receta/predicate'

/**
 * Returns a new list where the item with the given `id` has some fields replaced, keeping its other fields.
 *
 * Use when: a server response, a form or a websocket event carries part of a record, such as
 * `{ status: 'shipped' }` for one order, and the list in state must reflect it. The merge is
 * one level deep, and the `id` can't be changed through the patch. When no item has the id,
 * the same array comes back. The other items are the same objects as before.
 *
 * @example
 * ```ts
 * const orders = [{ id: 'o1', status: 'paid', total: 12 }, { id: 'o2', status: 'paid', total: 7 }]
 *
 * patchById(orders, 'o2', { status: 'shipped' })
 * // => [{ id: 'o1', status: 'paid', total: 12 }, { id: 'o2', status: 'shipped', total: 7 }]
 *
 * R.pipe(orders, patchById('o1', { total: 10, status: 'refunded' }))
 * // => [{ id: 'o1', status: 'refunded', total: 10 }, { id: 'o2', status: 'paid', total: 7 }]
 *
 * patchById(orders, 'o9', { status: 'lost' }) === orders
 * // => true
 * ```
 *
 * @tags patch, merge, update, id, entity, partial, list, row, websocket, immutable, lens
 * @see updateById - takes a function instead of fields
 * @see optional - @ontologyio/receta/lens, skips the write when no item has the id
 */
export function patchById<T extends { readonly id: unknown }>(
  items: readonly T[],
  id: T['id'],
  patch: Partial<Omit<T, 'id'>>,
): readonly T[]
export function patchById<T extends { readonly id: unknown }>(
  id: T['id'],
  patch: Partial<Omit<T, 'id'>>,
): (items: readonly T[]) => readonly T[]
export function patchById(...args: unknown[]): unknown {
  return R.purry(patchByIdImplementation, args)
}

const patchByIdImplementation = <T extends { readonly id: unknown }>(
  items: readonly T[],
  id: T['id'],
  patch: Partial<Omit<T, 'id'>>,
): readonly T[] => {
  const position = R.findIndex(items, prop<T, 'id'>('id', eq(id)))
  // The item's own id goes last, so a stray `id` in the patch can't move it to another record.
  return over(optional(index<T>(position)), map((item) => ({ ...item, ...patch, id: item.id })), items)
}
