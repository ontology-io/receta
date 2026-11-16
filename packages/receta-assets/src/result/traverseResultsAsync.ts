import * as R from 'remeda'
import { mapAsync, type MapAsyncError } from '@ontologyio/receta/async'
import { collect, flatMap, type Result } from '@ontologyio/receta/result'

export type TraverseResultsAsyncOptions = {
  /** How many steps may run at once. Defaults to all of them. */
  readonly concurrency?: number
}

/**
 * Runs an async step that resolves to a Result on every item, a few at a time, and returns all values or the first Err.
 *
 * Use when: each item needs an async call that reports failure as an `Err`, such as loading
 * users by id, checking stock per SKU or validating addresses against an API, and the caller
 * needs all of them or a reason why not. `concurrency` caps the calls in flight so a list of
 * 500 ids doesn't open 500 connections. Every item runs; the first `Err` in input order wins.
 * A step that rejects instead of resolving shows up as Receta's `MapAsyncError`.
 *
 * @example
 * ```ts
 * import { err, ok } from '@ontologyio/receta/result'
 *
 * const loadUser = async (id: number) => (id > 0 ? ok({ id }) : err(`no user ${id}`))
 *
 * await traverseResultsAsync([1, 2, 3], loadUser, { concurrency: 2 })
 * // => Ok([{ id: 1 }, { id: 2 }, { id: 3 }])
 *
 * await traverseResultsAsync([1, -2, -3], loadUser)
 * // => Err('no user -2')
 * ```
 *
 * @tags async, batch, concurrency, map, load, fetch, parallel, limit, all or nothing
 * @see traverseResults - the synchronous version, which stops at the first Err
 * @see mapAsync - @ontologyio/receta/async, the concurrency limit underneath
 */
export async function traverseResultsAsync<T, U, E>(
  items: readonly T[],
  step: (item: T, index: number) => Promise<Result<U, E>>,
  options: TraverseResultsAsyncOptions = {},
): Promise<Result<readonly U[], E | MapAsyncError>> {
  return R.pipe(
    await mapAsync(items, step, options),
    flatMap((results) => collect(results)),
  )
}
