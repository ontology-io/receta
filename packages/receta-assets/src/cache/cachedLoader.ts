import { invalidateMany, invalidateWhere, memoizeAsync } from '@ontologyio/receta/memo'
import { startsWith } from '@ontologyio/receta/predicate'
import { tryCatchAsync, type Result } from '@ontologyio/receta/result'

export type CachedLoaderOptions = {
  /** How long a loaded value stays. Defaults to until it is invalidated. */
  readonly ttlMs?: number
  /** Keep at most this many values, dropping the oldest. Defaults to no limit. */
  readonly maxEntries?: number
}

export type CachedLoaderError = {
  readonly code: 'LOAD_FAILED'
  readonly key: string
  readonly error: unknown
  readonly message: string
}

export type CachedLoader<T> = {
  /** The value for a key: loaded once, shared by concurrent callers, and loaded again after a failure. */
  readonly load: (key: string) => Promise<Result<T, CachedLoaderError>>
  /** Forgets these keys. */
  readonly invalidate: (...keys: readonly string[]) => void
  /** Forgets every key that starts with the prefix, such as `user:42:`. */
  readonly invalidatePrefix: (prefix: string) => void
}

/**
 * Caches an async loader by string key, with invalidation by key or by key prefix for when the data changes.
 *
 * Use when: values are cached under structured keys such as `user:42:profile` and
 * `user:42:orders`, and a write must drop a whole group, such as everything about user 42,
 * without clearing the rest. Concurrent loads of one key share a request, and a failed
 * load isn't kept, so the next call tries again.
 *
 * @example
 * ```ts
 * const db = new Map([['user:1:name', 'Ada'], ['user:1:plan', 'pro'], ['user:2:name', 'Bo']])
 * let reads = 0
 * const read = async (key: string) => {
 *   reads += 1
 *   return db.get(key) ?? 'missing'
 * }
 * const cache = cachedLoader(read)
 *
 * await cache.load('user:1:name')
 * // => Ok('Ada')
 *
 * await cache.load('user:2:name')
 * db.set('user:1:name', 'Ada L.')
 * cache.invalidatePrefix('user:1:')
 *
 * await cache.load('user:1:name')
 * // => Ok('Ada L.')
 *
 * await cache.load('user:2:name')
 * // => Ok('Bo')
 *
 * reads
 * // => 3
 * ```
 *
 * @tags cache, invalidate, prefix, namespace, loader, keys, write, purge
 * @see taggedLoader - invalidates by tags given with each load, not by key shape
 * @see invalidateWhere - @ontologyio/receta/memo, drops the entries whose key matches
 */
export function cachedLoader<T>(load: (key: string) => Promise<T>, options: CachedLoaderOptions = {}): CachedLoader<T> {
  const memoized = memoizeAsync(load, {
    ttl: options.ttlMs ?? Infinity,
    maxSize: options.maxEntries ?? Infinity,
  })
  return {
    load: (key) =>
      tryCatchAsync(
        () => memoized(key),
        (error): CachedLoaderError => ({ code: 'LOAD_FAILED', key, error, message: `Loading "${key}" failed` }),
      ),
    invalidate: (...keys) => invalidateMany(memoized, [...keys]),
    invalidatePrefix: (prefix) => invalidateWhere<string>(memoized, startsWith(prefix)),
  }
}
