import * as R from 'remeda'
import { filterValues, mapValues } from '@ontologyio/receta/object'
import { isNull, not } from '@ontologyio/receta/predicate'

type PatchOf<V> = V extends readonly unknown[] | Date | ((...args: never[]) => unknown)
  ? V
  : V extends object
    ? MergePatchInput<V>
    : V

/** A JSON Merge Patch for `T`: any part of it, at any depth, where `null` removes an optional key. */
export type MergePatchInput<T> = {
  readonly [K in keyof T]?: PatchOf<T[K]> | ({} extends Pick<T, K> ? null : never)
}

const applyPatch = (target: unknown, patch: unknown): unknown => {
  if (!R.isPlainObject(patch)) return patch
  const base: Record<string, unknown> = R.isPlainObject(target) ? target : {}
  const fields: Record<string, unknown> = patch
  const removed = R.keys(filterValues(fields, isNull))
  const merged = mapValues(filterValues(fields, not(isNull)), (value, key) => applyPatch(base[key], value))
  return { ...R.omit(base, removed), ...merged }
}

/**
 * Applies a JSON Merge Patch (RFC 7386): nested objects merge, `null` removes a key, anything else replaces.
 *
 * Use when: handling a `PATCH` request with `Content-Type: application/merge-patch+json`,
 * syncing partial updates from a client, or layering a stored override on a document. A patch
 * key set to `null` removes that key, a nested object is merged into the old value (or into
 * `{}` when there was none), and every other value, arrays included, replaces the old one
 * whole. Keys the patch doesn't mention stay. Neither input is changed. Because `null` means
 * "remove", a merge patch can't store a `null`, and the type only allows `null` on optional
 * keys.
 *
 * ```text
 *  each key of the patch
 *          │
 *          ▼
 *   ⟨ value is null? ⟩──yes──▶ ╭─────────────╮
 *          │ no                │ key removed │
 *          ▼                   ╰─────────────╯
 *   ⟨ plain object? ⟩──no──▶ ╭────────────────────────────────╮
 *          │ yes             │ value replaces the old one     │
 *          ▼                 ╰────────────────────────────────╯
 *   merge-patch it into the old value, or into {}
 * ```
 *
 * @example
 * ```ts
 * type Profile = { name: string; bio?: string; tags: string[]; links: { site?: string; x?: string } }
 *
 * const profile: Profile = { name: 'Ada', bio: 'Math', tags: ['a', 'b'], links: { site: 'ada.dev', x: '@ada' } }
 *
 * mergePatch(profile, { bio: null, tags: ['c'], links: { x: null } })
 * // => { name: 'Ada', tags: ['c'], links: { site: 'ada.dev' } }
 *
 * R.pipe(profile, mergePatch({ links: { site: 'ada.io' } }))
 * // => { name: 'Ada', bio: 'Math', tags: ['a', 'b'], links: { site: 'ada.io', x: '@ada' } }
 *
 * mergePatch(profile, {})
 * // => { name: 'Ada', bio: 'Math', tags: ['a', 'b'], links: { site: 'ada.dev', x: '@ada' } }
 * ```
 *
 * @tags patch, merge patch, rfc7386, json, http, partial update, delete, nested, merge
 * @see createMergePatch - builds the patch between two versions
 * @see filterValues - @ontologyio/receta/object, splits removals from updates
 * @see deepMerge - @ontologyio/receta/object, a merge where null is a value, not a removal
 */
export function mergePatch<T extends object>(target: T, patch: NoInfer<MergePatchInput<T>>): T
export function mergePatch<T extends object>(patch: NoInfer<MergePatchInput<T>>): (target: T) => T
export function mergePatch(...args: unknown[]): unknown {
  return R.purry(applyPatch, args)
}
