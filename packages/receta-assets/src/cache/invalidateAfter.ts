import * as R from 'remeda'
import {
  invalidateAll,
  invalidateMany,
  type MemoizedAsyncFunction,
  type MemoizedFunction,
} from '@ontologyio/receta/memo'
import { tap, tryCatchAsync, type Result } from '@ontologyio/receta/result'

export type InvalidateAfterTarget<A extends readonly unknown[]> = {
  /** A function made by `memoize`, `memoizeBy` or `memoizeAsync`. */
  readonly memoized: MemoizedFunction<readonly never[], unknown> | MemoizedAsyncFunction<readonly never[], unknown>
  /** The cache keys the write makes stale. Leave it out to clear that cache entirely. */
  readonly keys?: (...args: A) => readonly unknown[]
}

export type InvalidateAfterError = {
  readonly code: 'WRITE_FAILED'
  readonly error: unknown
  readonly message: string
}

/**
 * Wraps an async write so that, once it succeeds, the memoized reads it makes stale are invalidated.
 *
 * Use when: reads are memoized and writes change what they return, such as `getUser`
 * cached while `renameUser` and `deleteUser` change users, or a cached list that any
 * create must refresh. A failed write invalidates nothing, since the data didn't change.
 * Each target names a memoized function and the keys of the write's arguments; a target
 * without `keys` is cleared entirely, which suits lists and searches.
 *
 * @example
 * ```ts
 * import { memoizeAsync } from '@ontologyio/receta/memo'
 *
 * const db = new Map([['u1', 'Ada']])
 * let reads = 0
 * const getName = memoizeAsync(async (id: string) => {
 *   reads += 1
 *   return db.get(id) ?? 'unknown'
 * })
 * const saveName = async (id: string, name: string) => {
 *   db.set(id, name)
 *   return name
 * }
 * const rename = invalidateAfter(saveName, [{ memoized: getName, keys: (id) => [id] }])
 *
 * await getName('u1')
 * // => 'Ada'
 *
 * await rename('u1', 'Ada L.')
 * // => Ok('Ada L.')
 *
 * await getName('u1')
 * // => 'Ada L.'
 *
 * const conflict = async (_id: string, _name: string): Promise<string> => Promise.reject('conflict')
 * await invalidateAfter(conflict, [{ memoized: getName }])('u1', 'X')
 * // => Err({ code: 'WRITE_FAILED', error: 'conflict', message: 'The write failed, so nothing was invalidated' })
 *
 * reads
 * // => 2
 * ```
 *
 * @tags invalidate, write, mutation, stale, cache, memoize, consistency
 * @see writeThroughCache - puts the written value in the cache instead of dropping it
 * @see invalidateMany - @ontologyio/receta/memo, drops the listed keys
 */
export function invalidateAfter<A extends readonly unknown[], T>(
  write: (...args: A) => Promise<T>,
  targets: readonly InvalidateAfterTarget<A>[],
): (...args: A) => Promise<Result<T, InvalidateAfterError>> {
  const invalidate = (args: A) =>
    R.forEach(targets, ({ memoized, keys }) =>
      keys === undefined ? invalidateAll(memoized) : invalidateMany(memoized, [...keys(...args)]),
    )
  return async (...args) =>
    R.pipe(
      await tryCatchAsync(
        () => write(...args),
        (error): InvalidateAfterError => ({
          code: 'WRITE_FAILED',
          error,
          message: 'The write failed, so nothing was invalidated',
        }),
      ),
      tap(() => invalidate(args)),
    )
}
