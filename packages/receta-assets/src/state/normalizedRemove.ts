import * as R from 'remeda'
import { over, prop } from '@ontologyio/receta/lens'
import { not, oneOf } from '@ontologyio/receta/predicate'

/** Entities stored once by id, with `ids` keeping their order: the Redux "normalized" shape. */
export type NormalizedRemoveState<E extends { readonly id: string | number }> = {
  readonly ids: readonly E['id'][]
  readonly byId: Readonly<Record<string, E>>
}

/**
 * Removes entities by id from a normalized `{ ids, byId }` store, from both the order and the lookup.
 *
 * Use when: records are deleted, archived or evicted from an entity cache, such as a deleted
 * message, users who left a channel, or rows a bulk action removed. Ids that aren't stored are
 * ignored, and when none of them are, the same state object comes back. The remaining ids keep
 * their order.
 *
 * @example
 * ```ts
 * type Message = { id: number; text: string }
 *
 * const messages = {
 *   ids: [1, 2, 3],
 *   byId: { 1: { id: 1, text: 'hi' }, 2: { id: 2, text: 'spam' }, 3: { id: 3, text: 'bye' } },
 * }
 *
 * normalizedRemove<Message>(messages, [2])
 * // => { ids: [1, 3], byId: { 1: { id: 1, text: 'hi' }, 3: { id: 3, text: 'bye' } } }
 *
 * R.pipe(messages, normalizedRemove<Message>([7, 8])) === messages
 * // => true
 * ```
 *
 * @tags normalize, entities, remove, delete, evict, redux, cache, store, byId, lens
 * @see normalizedUpsert - adds or merges entities into the same shape
 * @see over - @ontologyio/receta/lens, updates `byId` and `ids` through their lenses
 */
export function normalizedRemove<E extends { readonly id: string | number }>(
  state: NormalizedRemoveState<E>,
  ids: readonly E['id'][],
): NormalizedRemoveState<E>
export function normalizedRemove<E extends { readonly id: string | number }>(
  ids: readonly E['id'][],
): (state: NormalizedRemoveState<E>) => NormalizedRemoveState<E>
export function normalizedRemove(...args: unknown[]): unknown {
  return R.purry(normalizedRemoveImplementation, args)
}

const normalizedRemoveImplementation = <E extends { readonly id: string | number }>(
  state: NormalizedRemoveState<E>,
  ids: readonly E['id'][],
): NormalizedRemoveState<E> => {
  const keys = R.pipe(
    ids,
    R.map((id) => String(id)),
    R.filter((key) => Object.hasOwn(state.byId, key)),
  )
  if (R.isEmpty(keys)) return state
  const isRemoved = (id: E['id']): boolean => oneOf(keys)(String(id))
  return R.pipe(
    state,
    over(prop<NormalizedRemoveState<E>, 'byId'>('byId'), (byId) => R.omit(byId, keys)),
    over(prop<NormalizedRemoveState<E>, 'ids'>('ids'), (current) => R.filter(current, not(isRemoved))),
  )
}
