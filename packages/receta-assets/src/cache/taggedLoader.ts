import { invalidateWhere, memoizeAsync } from '@ontologyio/receta/memo'
import { oneOf } from '@ontologyio/receta/predicate'
import { tryCatchAsync, type Result } from '@ontologyio/receta/result'

export type TaggedLoaderOptions = {
  /** How long a loaded value stays. Defaults to until one of its tags is invalidated. */
  readonly ttlMs?: number
}

export type TaggedLoaderError = {
  readonly code: 'LOAD_FAILED'
  readonly key: string
  readonly error: unknown
  readonly message: string
}

export type TaggedLoader<T> = {
  /** The value for a key, cached under the tags given with this call. */
  readonly load: (key: string, tags: readonly string[]) => Promise<Result<T, TaggedLoaderError>>
  /** Forgets every key cached with this tag. */
  readonly invalidateTag: (tag: string) => void
}

/**
 * Caches an async loader by key, with tags on each entry so one write can drop every entry that depends on it.
 *
 * Use when: one piece of data feeds many cached things whose keys don't share a shape, such
 * as a team's report, its member list and its billing page, and a change to the team must
 * drop them all. Each `load` names the tags its value depends on, like `team:7`;
 * `invalidateTag('team:7')` drops every entry tagged with it. A key keeps the tags from its
 * latest `load` call.
 *
 * @example
 * ```ts
 * let renders = 0
 * const render = async (page: string) => {
 *   renders += 1
 *   return `${page} #${renders}`
 * }
 * const pages = taggedLoader(render)
 *
 * await pages.load('team-7/report', ['team:7'])
 * // => Ok('team-7/report #1')
 *
 * await pages.load('team-7/members', ['team:7', 'users'])
 * await pages.load('team-8/report', ['team:8'])
 * pages.invalidateTag('team:7')
 *
 * await pages.load('team-7/report', ['team:7'])
 * // => Ok('team-7/report #4')
 *
 * await pages.load('team-8/report', ['team:8'])
 * // => Ok('team-8/report #3')
 * ```
 *
 * @tags cache, tags, invalidate, revalidate tag, dependencies, purge, surrogate keys
 * @see cachedLoader - invalidates by key or key prefix instead
 * @see invalidateWhere - @ontologyio/receta/memo, drops the entries whose key matches
 */
export function taggedLoader<T>(load: (key: string) => Promise<T>, options: TaggedLoaderOptions = {}): TaggedLoader<T> {
  const tagsByKey = new Map<string, readonly string[]>()
  const memoized = memoizeAsync(load, { ttl: options.ttlMs ?? Infinity })
  return {
    load: (key, tags) => {
      tagsByKey.set(key, tags)
      return tryCatchAsync(
        () => memoized(key),
        (error): TaggedLoaderError => ({ code: 'LOAD_FAILED', key, error, message: `Loading "${key}" failed` }),
      )
    },
    invalidateTag: (tag) => invalidateWhere<string>(memoized, (key) => oneOf(tagsByKey.get(key) ?? [])(tag)),
  }
}
