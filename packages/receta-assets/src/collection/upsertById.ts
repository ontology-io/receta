import * as R from 'remeda'
import { updateAt } from '@ontologyio/receta/collection'
import { by, eq } from '@ontologyio/receta/predicate'

/**
 * Replaces the item with the same `id` where it stands, or appends the item when the id is new.
 *
 * Use when: a form saves a record, a websocket pushes one, or an optimistic update lands, and
 * the cached list should show it without a refetch. The list's order doesn't change for an
 * edit. When the list holds the id twice, only the first copy is replaced. Returns a new
 * list and leaves the input alone.
 *
 * @example
 * ```ts
 * const todos = [
 *   { id: 1, title: 'Write tests', done: false },
 *   { id: 2, title: 'Ship it', done: false },
 * ]
 *
 * upsertById(todos, { id: 1, title: 'Write tests', done: true })
 * // => [
 * //   { id: 1, title: 'Write tests', done: true },
 * //   { id: 2, title: 'Ship it', done: false },
 * // ]
 *
 * const saved = { id: 3, title: 'Celebrate', done: false }
 * R.pipe(todos, upsertById(saved), R.map(R.prop('id')))
 * // => [1, 2, 3]
 * ```
 *
 * @tags upsert, insert or update, replace, save, cache, optimistic update, list, id
 * @see upsertManyById - the same for a batch of items
 * @see updateAt - @ontologyio/receta/collection, the in-place replacement
 */
export function upsertById<T extends { readonly id: string | number }>(
  items: readonly T[],
  item: NoInfer<T>,
): readonly T[]
export function upsertById<T extends { readonly id: string | number }>(
  item: T,
): (items: readonly T[]) => readonly T[]
export function upsertById(...args: unknown[]): unknown {
  return R.purry(upsertByIdImplementation, args)
}

const upsertByIdImplementation = <T extends { readonly id: string | number }>(
  items: readonly T[],
  item: T,
): readonly T[] => {
  const index = R.findIndex(items, by((existing: T) => existing.id, eq(item.id)))
  // findIndex says -1 when the id is new, and updateAt would read -1 as the last item.
  return index === -1 ? [...items, item] : updateAt(items, index, item)
}
