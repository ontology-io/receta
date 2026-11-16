import * as R from 'remeda'
import { err, isOk, mapErr, type Result } from '@ontologyio/receta/result'

/**
 * Runs async fallbacks one after another and resolves with the first Ok; later ones never start.
 *
 * Use when: a read has a preferred source and slower or costlier backups, such as memory
 * cache, then Redis, then the database, then a third-party API, and each source reports a
 * miss or failure as an `Err`. Attempts run in order, never in parallel, and stop at the
 * first `Ok`. When all fail, the `Err` holds every error in order. A rejected promise is not
 * caught; wrap that source with `tryCatchAsync` if it can throw.
 *
 * ```text
 *  ┌───────────┐  Ok   ╭───────────╮
 *  │ attempt 1 │──────▶│ Ok(value) │
 *  └─────┬─────┘       ╰───────────╯
 *        │ Err(e1)
 *        ▼
 *  ┌───────────┐  Ok   ╭───────────╮
 *  │ attempt 2 │──────▶│ Ok(value) │   attempt 3 and later never start
 *  └─────┬─────┘       ╰───────────╯
 *        │ Err(e2), then each attempt left in the same way
 *        ▼
 *  ╭──────────────────────╮
 *  │ Err([e1, e2, …, en]) │
 *  ╰──────────────────────╯
 * ```
 *
 * @example
 * ```ts
 * import { err, ok } from '@ontologyio/receta/result'
 *
 * const asked: string[] = []
 * const source = (name: string, found: boolean) => async () => {
 *   asked.push(name)
 *   return found ? ok(`${name} value`) : err(`${name} miss`)
 * }
 *
 * await firstOkAsync([source('cache', false), source('db', true), source('api', true)])
 * // => Ok('db value')
 *
 * asked
 * // => ['cache', 'db']
 *
 * await firstOkAsync([source('cache', false), source('db', false)])
 * // => Err(['cache miss', 'db miss'])
 * ```
 *
 * @tags fallback, cache, read through, async, first, cascade, sources, failover
 * @see firstOk - the same for synchronous attempts
 * @see tryCatchAsync - @ontologyio/receta/result, turns a source that throws into one that returns Err
 */
export async function firstOkAsync<T, E>(
  attempts: readonly (() => Promise<Result<T, E>>)[],
): Promise<Result<T, readonly E[]>> {
  return R.reduce(
    attempts,
    async (pending: Promise<Result<T, readonly E[]>>, attempt) => {
      const previous = await pending
      return isOk(previous) ? previous : mapErr(await attempt(), (error) => [...previous.error, error])
    },
    Promise.resolve(err([])),
  )
}
