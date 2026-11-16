import * as R from 'remeda'
import { index, optional, over } from '@ontologyio/receta/lens'
import { map } from '@ontologyio/receta/option'
import { eq, prop } from '@ontologyio/receta/predicate'

/**
 * Returns a new list where the item with the given `id` is replaced by `update(item)`, and all others are kept.
 *
 * Use when: a list in state holds records with an `id`, such as todos, rows, messages or
 * products, and one of them changes: renamed, completed, refreshed from the server. Only the
 * first item with that id is updated, and its position stays. When no item has the id, the
 * same array comes back, so a stale event changes nothing. The other items are the same
 * objects as before.
 *
 * @example
 * ```ts
 * const todos = [{ id: 1, title: 'Write', done: false }, { id: 2, title: 'Ship', done: false }]
 *
 * updateById(todos, 2, (todo) => ({ ...todo, title: 'Ship it' }))
 * // => [{ id: 1, title: 'Write', done: false }, { id: 2, title: 'Ship it', done: false }]
 *
 * R.pipe(todos, updateById(1, (todo) => ({ ...todo, done: true })))
 * // => [{ id: 1, title: 'Write', done: true }, { id: 2, title: 'Ship', done: false }]
 *
 * updateById(todos, 9, (todo) => ({ ...todo, done: true })) === todos
 * // => true
 * ```
 *
 * @tags update, id, entity, item, list, array, replace, edit, row, immutable, lens
 * @see patchById - merges some fields instead of taking a function
 * @see updateWhereAt - updates every item that matches, inside nested state
 * @see optional - @ontologyio/receta/lens, skips the write when no item has the id
 */
export function updateById<T extends { readonly id: unknown }>(
  items: readonly T[],
  id: T['id'],
  update: (item: T) => T,
): readonly T[]
export function updateById<T extends { readonly id: unknown }>(
  id: T['id'],
  update: (item: T) => T,
): (items: readonly T[]) => readonly T[]
export function updateById(...args: unknown[]): unknown {
  return R.purry(updateByIdImplementation, args)
}

const updateByIdImplementation = <T extends { readonly id: unknown }>(
  items: readonly T[],
  id: T['id'],
  update: (item: T) => T,
): readonly T[] => {
  const position = R.findIndex(items, prop<T, 'id'>('id', eq(id)))
  // No match gives position -1: the lens then sees None and the write leaves the list as it was.
  return over(optional(index<T>(position)), map(update), items)
}
