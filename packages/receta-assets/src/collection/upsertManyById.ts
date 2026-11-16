import * as R from 'remeda'
import { fromNullable, unwrapOr } from '@ontologyio/receta/option'
import { by, isDefined, not } from '@ontologyio/receta/predicate'

/**
 * Merges a batch of fresh items into a list by `id`: known ids are replaced in place, new ids appended.
 *
 * Use when: a refresh, a websocket batch or the next page of a feed brings items the cached
 * list may already hold, and the list should show the fresh copies without losing its order.
 * New items are appended in the order they first appear in the batch. When the batch holds an
 * id twice, its last copy wins.
 *
 * @example
 * ```ts
 * const cached = [
 *   { id: 1, status: 'open' },
 *   { id: 2, status: 'open' },
 * ]
 * const fresh = [
 *   { id: 3, status: 'open' },
 *   { id: 1, status: 'closed' },
 * ]
 *
 * upsertManyById(cached, fresh)
 * // => [
 * //   { id: 1, status: 'closed' },
 * //   { id: 2, status: 'open' },
 * //   { id: 3, status: 'open' },
 * // ]
 *
 * const replays = [{ id: 4, status: 'open' }, { id: 4, status: 'merged' }]
 * R.pipe(cached, upsertManyById(replays), R.map(R.prop('status')))
 * // => ['open', 'open', 'merged']
 * ```
 *
 * @tags upsert, merge, sync, refresh, batch, cache, feed, replace, append, id
 * @see upsertById - the same for one item
 * @see mergeById - applies partial patches instead of whole items
 */
export function upsertManyById<T extends { readonly id: string | number }>(
  items: readonly T[],
  incoming: readonly NoInfer<T>[],
): readonly T[]
export function upsertManyById<T extends { readonly id: string | number }>(
  incoming: readonly T[],
): (items: readonly T[]) => readonly T[]
export function upsertManyById(...args: unknown[]): unknown {
  return R.purry(upsertManyByIdImplementation, args)
}

const upsertManyByIdImplementation = <T extends { readonly id: string | number }>(
  items: readonly T[],
  incoming: readonly T[],
): readonly T[] => {
  // indexBy keeps the last copy of an id, which is the freshest one in the batch.
  const freshById = R.indexBy(incoming, (item) => item.id)
  const latest = (item: T): T => unwrapOr(fromNullable(freshById[item.id]), item)
  const known = R.indexBy(items, (item) => item.id)
  const isKnown = by((item: T) => known[item.id], isDefined)
  return [
    ...R.map(items, latest),
    ...R.pipe(incoming, R.filter(not(isKnown)), R.uniqueBy((item) => item.id), R.map(latest)),
  ]
}
