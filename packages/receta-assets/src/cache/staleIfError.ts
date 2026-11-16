import { lruCache, memoizeAsync } from '@ontologyio/receta/memo'
import { match } from '@ontologyio/receta/option'
import { err, isOk, ok, tryCatchAsync, type Result } from '@ontologyio/receta/result'

export type StaleIfErrorOptions = {
  /** How long a loaded value is used before the next call loads it again. */
  readonly ttlMs: number
  /** Keep the last good value of at most this many keys. Defaults to 1000. */
  readonly maxEntries?: number
}

export type StaleIfErrorValue<T> = {
  readonly value: T
  /** True when loading failed and this is the last value that loaded. */
  readonly stale: boolean
}

export type StaleIfErrorError = {
  readonly code: 'LOAD_FAILED'
  readonly key: string
  readonly error: unknown
  readonly message: string
}

/**
 * Caches an async loader for a while, and when a reload fails, serves the last value that loaded, marked stale.
 *
 * Use when: old data beats no data during an outage, such as prices, a catalog, a weather
 * widget or remote config, and the screen can say "may be out of date". Values are reused
 * for `ttlMs`; after that the next call reloads and waits. If the reload fails, the last
 * good value comes back with `stale: true`. Only a key that never loaded fails.
 *
 * ```text
 *  ⟨ loaded under ttlMs ago ⟩──yes──▶ ╭─────────────────────────────╮
 *           │ no                      │ Ok({ value, stale: false }) │
 *           ▼                         ╰─────────────────────────────╯
 *  ┌───────────────┐  loads   ╭─────────────────────────────╮
 *  │ load and wait │─────────▶│ Ok({ value, stale: false }) │
 *  └───────┬───────┘          ╰─────────────────────────────╯
 *          │ fails
 *          ▼
 *  ⟨ loaded before ⟩──yes──▶ ╭───────────────────────────────────────╮
 *          │ no              │ Ok({ value: last good, stale: true }) │
 *          ▼                 ╰───────────────────────────────────────╯
 *  ╭──────────────────────────────╮
 *  │ Err({ code: 'LOAD_FAILED' }) │
 *  ╰──────────────────────────────╯
 * ```
 *
 * @example
 * ```ts
 * import { sleep } from '@ontologyio/receta/async'
 *
 * let up = true
 * let version = 0
 * const fetchPrices = async (market: string) => {
 *   version += 1
 *   return up ? `${market} prices v${version}` : Promise.reject('down')
 * }
 * const prices = staleIfError(fetchPrices, { ttlMs: 5 })
 *
 * await prices('NYSE')
 * // => Ok({ value: 'NYSE prices v1', stale: false })
 *
 * up = false
 * await sleep(10)
 * await prices('NYSE')
 * // => Ok({ value: 'NYSE prices v1', stale: true })
 *
 * await prices('LSE')
 * // => Err({ code: 'LOAD_FAILED', key: 'LSE', error: 'down', message: 'Loading "LSE" failed, and it never loaded before' })
 * ```
 *
 * @tags stale if error, fallback, outage, cache, last known good, resilience, degrade
 * @see staleWhileRevalidate - serves old data at once and reloads it in the background
 * @see memoizeAsync - @ontologyio/receta/memo, keeps fresh values for ttlMs and shares loads
 */
export function staleIfError<T>(
  load: (key: string) => Promise<T>,
  options: StaleIfErrorOptions,
): (key: string) => Promise<Result<StaleIfErrorValue<T>, StaleIfErrorError>> {
  const fresh = memoizeAsync(load, { ttl: options.ttlMs })
  const lastGood = lruCache<string, T>(options.maxEntries ?? 1000)

  return async (key) => {
    const loaded = await tryCatchAsync(() => fresh(key))
    if (isOk(loaded)) {
      lastGood.set(key, loaded.value)
      return ok({ value: loaded.value, stale: false })
    }
    return match(lastGood.get(key), {
      onSome: (value): Result<StaleIfErrorValue<T>, StaleIfErrorError> => ok({ value, stale: true }),
      onNone: () =>
        err({
          code: 'LOAD_FAILED',
          key,
          error: loaded.error,
          message: `Loading "${key}" failed, and it never loaded before`,
        }),
    })
  }
}
