import * as R from 'remeda'
import { sleep } from '@ontologyio/receta/async'
import { memoizeAsync } from '@ontologyio/receta/memo'
import { filter, fromNullable, isSome, none, some, type Option } from '@ontologyio/receta/option'
import { map, mapErr, tryCatchAsync, type Result } from '@ontologyio/receta/result'

export type BatchedLoaderOptions = {
  /** How long a batch collects keys before it loads. Defaults to 0: the keys asked for in one tick. */
  readonly waitMs?: number
  /** Load a batch as soon as it has this many keys, such as an API's limit per call. Defaults to no limit. */
  readonly maxBatchSize?: number
}

export type BatchedLoaderError<K> = {
  readonly code: 'BATCH_FAILED'
  readonly key: K
  readonly error: unknown
  readonly message: string
}

/**
 * Collects the keys asked for at about the same time into one batched load, and gives each caller its own value.
 *
 * Use when: code asks for records one at a time but the source can return many in one go,
 * such as GraphQL resolvers loading each post's author, or a loop calling a "get user"
 * that has a "get users" endpoint. N lookups become one call: the N+1 query problem.
 * `loadMany` gets each key once and may return the values in any order; `keyOf` matches
 * them back, and a key with no value is `Ok(None)`. Answers are kept for the loader's life,
 * so make one loader per request. A failed batch isn't kept.
 *
 * ```text
 *  0 ms                waitMs
 *  ├─ load('u1') ─┐       │
 *  ├─ load('u2') ─┤ one   │
 *  ├─ load('u1') ─┤ batch ├──▶ loadMany(['u1', 'u2', 'u9'])
 *  ├─ load('u9') ─┘       │        │ values matched back by keyOf
 *  │                      │        ▼
 *  │                      │   each caller: Ok(Some(value)), Ok(None) when
 *  │                      │   loadMany left it out, or Err if loadMany failed
 * ```
 *
 * @example
 * ```ts
 * import { mapAsync } from '@ontologyio/receta/async'
 * import { oneOf, where } from '@ontologyio/receta/predicate'
 *
 * type User = { readonly id: string; readonly name: string }
 * const users: User[] = [{ id: 'u1', name: 'Ada' }, { id: 'u2', name: 'Bo' }]
 * const batches: string[][] = []
 * const loadUsers = async (ids: readonly string[]) => {
 *   batches.push([...ids])
 *   return R.filter(users, where<User>({ id: oneOf(ids) }))
 * }
 * const userById = batchedLoader(loadUsers, (user) => user.id)
 *
 * await mapAsync(['u1', 'u2', 'u1', 'u9'], userById)
 * // => Ok([
 * //   Ok(Some({ id: 'u1', name: 'Ada' })),
 * //   Ok(Some({ id: 'u2', name: 'Bo' })),
 * //   Ok(Some({ id: 'u1', name: 'Ada' })),
 * //   Ok(None),
 * // ])
 *
 * batches
 * // => [['u1', 'u2', 'u9']]
 * ```
 *
 * @tags dataloader, batch, n+1, graphql, coalesce, bulk lookup, resolver
 * @see singleFlight - shares one request per key, without batching keys together
 * @see memoizeAsync - @ontologyio/receta/memo, keeps one answer per key
 */
export function batchedLoader<K extends string | number, V>(
  loadMany: (keys: readonly K[]) => Promise<readonly V[]>,
  keyOf: (value: V) => K,
  options: BatchedLoaderOptions = {},
): (key: K) => Promise<Result<Option<V>, BatchedLoaderError<K>>> {
  type Batch = { readonly keys: K[]; readonly loaded: Promise<Result<Partial<Record<K, V>>, unknown>> }
  // The batch still taking keys, if any.
  let open: Option<Batch> = none()

  const close = (keys: readonly K[]) => {
    open = R.pipe(open, filter((batch) => batch.keys !== keys))
  }

  const startBatch = (): Batch => {
    const keys: K[] = []
    const loaded = (async () => {
      await sleep(options.waitMs ?? 0)
      close(keys)
      return R.pipe(
        await tryCatchAsync(() => loadMany(keys)),
        map((values): Partial<Record<K, V>> => R.indexBy(values, keyOf)),
      )
    })()
    return { keys, loaded }
  }

  const loadOne = async (key: K): Promise<Result<Option<V>, BatchedLoaderError<K>>> => {
    const batch = isSome(open) ? open.value : startBatch()
    open = some(batch)
    batch.keys.push(key)
    if (batch.keys.length >= (options.maxBatchSize ?? Infinity)) close(batch.keys)
    return R.pipe(
      await batch.loaded,
      map((byKey) => fromNullable<V>(byKey[key])),
      mapErr((error): BatchedLoaderError<K> => ({ code: 'BATCH_FAILED', key, error, message: `The batch with "${key}" failed` })),
    )
  }

  // A repeated key shares its first answer, and memoizeAsync drops an Err so it is asked for again.
  return memoizeAsync(loadOne)
}
