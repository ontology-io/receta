import * as R from 'remeda'
import { memoizeAsync } from '@ontologyio/receta/memo'
import { map, tap, tryCatchAsync, type Result } from '@ontologyio/receta/result'

export type WriteThroughCacheStore<K, V> = {
  readonly load: (key: K) => Promise<V>
  readonly save: (key: K, value: V) => Promise<unknown>
}

export type WriteThroughCacheOptions = {
  /** How long a value stays. Defaults to until it is written again. */
  readonly ttlMs?: number
}

export type WriteThroughCacheError<K> = {
  readonly code: 'LOAD_FAILED' | 'SAVE_FAILED'
  readonly key: K
  readonly error: unknown
  readonly message: string
}

export type WriteThroughCache<K, V> = {
  /** The value for a key, loaded once and shared, and loaded again after a failure. */
  readonly get: (key: K) => Promise<Result<V, WriteThroughCacheError<K>>>
  /** Saves the value, then caches it. A failed save leaves the cache as it was. */
  readonly set: (key: K, value: V) => Promise<Result<V, WriteThroughCacheError<K>>>
}

/**
 * Caches reads from a store, and sends writes to the store first, caching the new value only once the save succeeds.
 *
 * Use when: a value is read far more than written, such as user settings, a profile or a
 * feature configuration, and a read right after a write must see the write without going
 * back to the database. The cache never holds a value the store rejected. Concurrent reads
 * of one key share a load.
 *
 * @example
 * ```ts
 * const db = new Map([['theme', 'light']])
 * let reads = 0
 * const settings = writeThroughCache({
 *   load: async (key: string) => {
 *     reads += 1
 *     return db.get(key) ?? 'unset'
 *   },
 *   save: async (key: string, value: string) => db.set(key, value),
 * })
 *
 * await settings.get('theme')
 * // => Ok('light')
 *
 * await settings.set('theme', 'dark')
 * // => Ok('dark')
 *
 * await settings.get('theme')
 * // => Ok('dark')
 *
 * reads
 * // => 1
 * ```
 *
 * @tags write through, cache, settings, read after write, store, database, consistency
 * @see invalidateAfter - drops cached entries after a write instead of replacing them
 * @see memoizeAsync - @ontologyio/receta/memo, the read cache
 */
export function writeThroughCache<K, V>(
  store: WriteThroughCacheStore<K, V>,
  options: WriteThroughCacheOptions = {},
): WriteThroughCache<K, V> {
  const read = memoizeAsync((key: K) => store.load(key), { ttl: options.ttlMs ?? Infinity })
  const failed =
    (code: WriteThroughCacheError<K>['code'], key: K, verb: string) =>
    (error: unknown): WriteThroughCacheError<K> => ({ code, key, error, message: `${verb} "${String(key)}" failed` })

  return {
    get: (key) => tryCatchAsync(() => read(key), failed('LOAD_FAILED', key, 'Loading')),
    set: async (key, value) =>
      R.pipe(
        await tryCatchAsync(() => store.save(key, value), failed('SAVE_FAILED', key, 'Saving')),
        tap(() => read.cache.set(key, Promise.resolve(value))),
        map(() => value),
      ),
  }
}
