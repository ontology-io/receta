import * as R from 'remeda'
import { over, prop } from '@ontologyio/receta/lens'

/** Entities stored once by id, with `ids` keeping their order: the Redux "normalized" shape. */
export type NormalizedUpsertState<E extends { readonly id: string | number }> = {
  readonly ids: readonly E['id'][]
  readonly byId: Readonly<Record<string, E>>
}

/**
 * Adds new entities to a normalized `{ ids, byId }` store and merges updates into the ones it already has.
 *
 * Use when: a page of results, a websocket batch or a mutation response must land in an
 * entity cache keyed by id, where the same record can arrive again with only some fields and
 * the list order must not jump. A new id is appended to `ids` and stored whole. A known id
 * keeps its place, and the incoming fields are merged over the stored ones, one level deep.
 * The same id twice in one batch is merged twice. Other entities are the same objects as
 * before.
 *
 * ```text
 *  each entity ──▶ ⟨ id already in byId? ⟩──yes──▶ ╭────────────────────────────╮
 *                          │ no                     │ byId[id] = old ⊕ entity    │
 *                          ▼                        │ ids unchanged              │
 *                ╭────────────────────────────╮     ╰────────────────────────────╯
 *                │ byId[id] = entity          │
 *                │ id appended to ids         │
 *                ╰────────────────────────────╯
 * ```
 *
 * @example
 * ```ts
 * type User = { id: string; name: string; online?: boolean }
 *
 * const users = { ids: ['u1'], byId: { u1: { id: 'u1', name: 'Ada', online: false } } }
 *
 * normalizedUpsert<User>(users, [{ id: 'u2', name: 'Linus' }, { id: 'u1', name: 'Ada', online: true }])
 * // => {
 * //   ids: ['u1', 'u2'],
 * //   byId: { u1: { id: 'u1', name: 'Ada', online: true }, u2: { id: 'u2', name: 'Linus' } },
 * // }
 *
 * R.pipe(users, normalizedUpsert<User>([]))
 * // => { ids: ['u1'], byId: { u1: { id: 'u1', name: 'Ada', online: false } } }
 * ```
 *
 * @tags normalize, entities, upsert, redux, cache, store, byId, merge, insert or update, lens
 * @see normalizedRemove - removes entities from the same shape
 * @see over - @ontologyio/receta/lens, updates `byId` and `ids` through their lenses
 */
export function normalizedUpsert<E extends { readonly id: string | number }>(
  state: NormalizedUpsertState<E>,
  entities: readonly E[],
): NormalizedUpsertState<E>
export function normalizedUpsert<E extends { readonly id: string | number }>(
  entities: readonly E[],
): (state: NormalizedUpsertState<E>) => NormalizedUpsertState<E>
export function normalizedUpsert(...args: unknown[]): unknown {
  return R.purry(normalizedUpsertImplementation, args)
}

const normalizedUpsertImplementation = <E extends { readonly id: string | number }>(
  state: NormalizedUpsertState<E>,
  entities: readonly E[],
): NormalizedUpsertState<E> => {
  const byIdLens = prop<NormalizedUpsertState<E>, 'byId'>('byId')
  const idsLens = prop<NormalizedUpsertState<E>, 'ids'>('ids')
  const upsertOne = (current: NormalizedUpsertState<E>, entity: E): NormalizedUpsertState<E> => {
    const key = String(entity.id)
    const stored = Object.hasOwn(current.byId, key) ? current.byId[key] : undefined
    const withEntity = over(byIdLens, (byId) => ({ ...byId, [key]: { ...stored, ...entity } }), current)
    return R.isDefined(stored) ? withEntity : over(idsLens, (ids) => [...ids, entity.id], withEntity)
  }
  return R.reduce(entities, upsertOne, state)
}
