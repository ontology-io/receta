import { lruCache, memoizeAsync } from '@ontologyio/receta/memo'
import { isNone } from '@ontologyio/receta/option'
import { ok, tryCatchAsync, type Result } from '@ontologyio/receta/result'

export type StaleWhileRevalidateOptions = {
  /** How long a value counts as fresh. After that it is still served, and reloaded behind it. */
  readonly freshMs: number
  /** The clock, such as `Date.now`. A test passes a fake one. */
  readonly now: () => number
  /** Keep at most this many keys, dropping the least recently used. Defaults to 1000. */
  readonly maxEntries?: number
}

export type StaleWhileRevalidateError = {
  readonly code: 'LOAD_FAILED'
  readonly key: string
  readonly error: unknown
  readonly message: string
}

/**
 * Serves a cached value at once even when it is old, and reloads it in the background so the next call gets a fresh one.
 *
 * Use when: speed matters more than the last few seconds of freshness, such as a product
 * page, exchange rates on a dashboard, or a list of a user's projects, so no caller should
 * wait on a reload once a value exists. Only the very first call per key waits. A
 * background reload that fails is ignored and the old value stays; concurrent reloads of
 * one key share a request.
 *
 * ```text
 *  ⟨ cached ⟩──no──▶ load and wait ──▶ Ok(value), or Err({ code: 'LOAD_FAILED' })
 *      │ yes
 *      ▼
 *  ⟨ younger than freshMs ⟩──yes──▶ Ok(cached value)
 *      │ no
 *      ▼
 *  Ok(cached value) at once, and a reload starts behind it;
 *  a failed reload keeps the cached value
 * ```
 *
 * @example
 * ```ts
 * import { sleep } from '@ontologyio/receta/async'
 *
 * let time = 0
 * let version = 0
 * const loadRates = async (currency: string) => {
 *   version += 1
 *   return `${currency} rates v${version}`
 * }
 * const rates = staleWhileRevalidate(loadRates, { freshMs: 100, now: () => time })
 *
 * await rates('EUR')
 * // => Ok('EUR rates v1')
 *
 * time = 150
 * await rates('EUR')
 * // => Ok('EUR rates v1')
 *
 * await sleep(1)
 * await rates('EUR')
 * // => Ok('EUR rates v2')
 * ```
 *
 * @tags stale while revalidate, swr, background refresh, cache, fast, stale, http cache
 * @see staleIfError - waits for fresh data, and falls back to old data only when loading fails
 * @see lruCache - @ontologyio/receta/memo, holds the values and their load times
 */
export function staleWhileRevalidate<T>(
  load: (key: string) => Promise<T>,
  options: StaleWhileRevalidateOptions,
): (key: string) => Promise<Result<T, StaleWhileRevalidateError>> {
  const entries = lruCache<string, { readonly value: T; readonly loadedAt: number }>(options.maxEntries ?? 1000)

  // Shares one load per key while it runs, and stores what it brings back.
  const loading = memoizeAsync(async (key: string) => {
    const value = await load(key)
    entries.set(key, { value, loadedAt: options.now() })
    return value
  })

  const reload = async (key: string): Promise<Result<T, StaleWhileRevalidateError>> => {
    const outcome = await tryCatchAsync(
      () => loading(key),
      (error): StaleWhileRevalidateError => ({ code: 'LOAD_FAILED', key, error, message: `Loading "${key}" failed` }),
    )
    // The value now lives in entries, so the next reload must start a new request.
    loading.cache.delete(key)
    return outcome
  }

  return async (key) => {
    const cached = entries.get(key)
    if (isNone(cached)) return reload(key)
    if (options.now() - cached.value.loadedAt >= options.freshMs) void reload(key)
    return ok(cached.value.value)
  }
}
