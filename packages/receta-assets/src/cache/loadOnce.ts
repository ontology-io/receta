import { clearCache, memoizeAsync } from '@ontologyio/receta/memo'
import { tryCatchAsync, type Result } from '@ontologyio/receta/result'

export type LoadOnceError = {
  readonly code: 'LOAD_FAILED'
  readonly error: unknown
  readonly message: string
}

export type LoadOnce<T> = {
  (): Promise<Result<T, LoadOnceError>>
  /** Forgets the value, so the next call loads again. */
  readonly reset: () => void
}

/**
 * Loads a value on first use and shares it with every later call, trying again after a failure.
 *
 * Use when: something should be set up once, lazily, such as a database pool, an SDK client,
 * remote config or a compiled schema, and calls during startup must share the one load
 * instead of racing to make several. A failed load isn't kept, so the next call tries
 * again; `reset()` forgets a good value too, such as after a config change.
 *
 * @example
 * ```ts
 * let attempts = 0
 * const connect = async () => {
 *   attempts += 1
 *   return attempts === 1 ? Promise.reject('ECONNREFUSED') : `pool #${attempts}`
 * }
 * const getPool = loadOnce(connect)
 *
 * await getPool()
 * // => Err({ code: 'LOAD_FAILED', error: 'ECONNREFUSED', message: 'Loading failed; the next call tries again' })
 *
 * await getPool()
 * // => Ok('pool #2')
 *
 * await getPool()
 * // => Ok('pool #2')
 *
 * getPool.reset()
 * await getPool()
 * // => Ok('pool #3')
 * ```
 *
 * @tags lazy, once, singleton, init, startup, connection, config, reset
 * @see cachedUntilExpiry - loads again when the value expires
 * @see memoizeAsync - @ontologyio/receta/memo, shares the load and drops a failed one
 */
export function loadOnce<T>(load: () => Promise<T>): LoadOnce<T> {
  const once = memoizeAsync(load, { keyFn: () => 'value' })
  const get = () =>
    tryCatchAsync(
      () => once(),
      (error): LoadOnceError => ({ code: 'LOAD_FAILED', error, message: 'Loading failed; the next call tries again' }),
    )
  return Object.assign(get, { reset: () => clearCache(once) })
}
