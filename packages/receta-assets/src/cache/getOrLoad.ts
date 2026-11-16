import * as R from 'remeda'
import type { Cache } from '@ontologyio/receta/memo'
import { filter, isSome, match } from '@ontologyio/receta/option'
import { eq } from '@ontologyio/receta/predicate'
import { isErr, tryCatchAsync, type Result } from '@ontologyio/receta/result'

export type GetOrLoadError<K> = {
  readonly code: 'LOAD_FAILED'
  readonly key: K
  readonly error: unknown
  readonly message: string
}

/**
 * Returns the cached promise for a key, or starts the load and caches its promise, and drops it again if it fails.
 *
 * Use when: an async read goes through a cache the code holds directly, such as a
 * `ttlCache` of sessions shared by several handlers. The promise is stored before it
 * settles, so concurrent callers share one load instead of each starting their own. A
 * failed load is removed, so the next caller tries again, unless the entry was already
 * replaced by then.
 *
 * @example
 * ```ts
 * import { ttlCache } from '@ontologyio/receta/memo'
 *
 * const sessions = ttlCache<string, Promise<string>>(60_000)
 * let fetches = 0
 * const fetchSession = async (id: string) => {
 *   fetches += 1
 *   return `session ${id}`
 * }
 *
 * await getOrLoad(sessions, 's1', fetchSession)
 * // => Ok('session s1')
 *
 * await getOrLoad(sessions, 's1', fetchSession)
 * fetches
 * // => 1
 *
 * const missing = async (id: string): Promise<string> => Promise.reject(`no session ${id}`)
 * await getOrLoad(sessions, 's2', missing)
 * // => Err({ code: 'LOAD_FAILED', key: 's2', error: 'no session s2', message: 'Loading "s2" failed' })
 *
 * sessions.has('s2')
 * // => false
 * ```
 *
 * @tags cache aside, read through, promise cache, async, dedupe, get or set
 * @see getOrCompute - the same for a value computed synchronously
 * @see ttlCache - @ontologyio/receta/memo, one of the caches it works with
 */
export async function getOrLoad<K, V>(
  cache: Cache<K, Promise<V>>,
  key: K,
  load: (key: K) => Promise<V>,
): Promise<Result<V, GetOrLoadError<K>>> {
  const pending = match(cache.get(key), {
    onSome: (cached) => cached,
    onNone: () => {
      // The async wrapper turns a load that throws before returning a promise into a rejection.
      const started = (async () => load(key))()
      cache.set(key, started)
      return started
    },
  })
  const loaded = await tryCatchAsync(
    () => pending,
    (error): GetOrLoadError<K> => ({ code: 'LOAD_FAILED', key, error, message: `Loading "${String(key)}" failed` }),
  )
  const stillOurs = R.pipe(cache.get(key), filter(eq(pending)), isSome)
  if (isErr(loaded) && stillOurs) cache.delete(key)
  return loaded
}
