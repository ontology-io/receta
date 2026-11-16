import * as R from 'remeda'
import { index, optional, over } from '@ontologyio/receta/lens'
import type { KeysOfType } from '@ontologyio/receta/object'
import { map } from '@ontologyio/receta/option'
import { eq, prop } from '@ontologyio/receta/predicate'

/**
 * Returns a new list where a boolean field of the item with the given `id` is flipped.
 *
 * Use when: a checkbox or switch in a list row flips one flag, such as a todo's `done`, an
 * email's `starred`, a feature's `enabled` or a row's `selected`. The field must be a boolean
 * in the item type, or the call doesn't compile. When no item has the id, the same array
 * comes back. The other items are the same objects as before.
 *
 * @example
 * ```ts
 * const todos = [{ id: 1, title: 'Write', done: false, starred: true }, { id: 2, title: 'Ship', done: false, starred: false }]
 *
 * toggleById(todos, 1, 'done')
 * // => [{ id: 1, title: 'Write', done: true, starred: true }, { id: 2, title: 'Ship', done: false, starred: false }]
 *
 * R.pipe(todos, toggleById(1, 'starred'))[0]
 * // => { id: 1, title: 'Write', done: false, starred: false }
 *
 * toggleById(todos, 3, 'done') === todos
 * // => true
 * ```
 *
 * @tags toggle, todo, done, complete, checkbox, star, flag, boolean, id, list, lens
 * @see toggleAt - flips a flag at a dot path in nested state
 * @see updateById - any change to the item with an id
 */
export function toggleById<T extends { readonly id: unknown }>(
  items: readonly T[],
  id: T['id'],
  field: KeysOfType<T, boolean>,
): readonly T[]
export function toggleById<T extends { readonly id: unknown }>(
  id: T['id'],
  field: KeysOfType<T, boolean>,
): (items: readonly T[]) => readonly T[]
export function toggleById(...args: unknown[]): unknown {
  return R.purry(toggleByIdImplementation, args)
}

const toggleByIdImplementation = <T extends { readonly id: unknown }>(
  items: readonly T[],
  id: T['id'],
  field: KeysOfType<T, boolean>,
): readonly T[] => {
  const position = R.findIndex(items, prop<T, 'id'>('id', eq(id)))
  const flip = (item: T): T => ({ ...item, [field]: item[field] !== true })
  return over(optional(index<T>(position)), map(flip), items)
}
