import * as R from 'remeda'
import { filterValues, mapValues, type PlainObject } from '@ontologyio/receta/object'
import { isUndefined, not } from '@ontologyio/receta/predicate'

const createPatch = (before: PlainObject, after: PlainObject): PlainObject => {
  // JSON drops undefined, so a key set to undefined is as gone as a missing one.
  const isGone = (key: string): boolean => isUndefined(after[key])
  const isChanged = (value: unknown, key: string): boolean => !isUndefined(value) && !R.isDeepEqual(before[key], value)
  // Two objects get a nested patch; anything else is sent whole.
  const toPatchValue = (value: unknown, key: string): unknown => {
    const old = before[key]
    return R.isPlainObject(value) && R.isPlainObject(old) ? createPatch(old, value) : value
  }
  const removals = R.pipe(
    R.keys(before),
    R.filter(isGone),
    R.map((key) => [key, null] as const),
    R.fromEntries(),
  )
  const updates = R.pipe(after, filterValues(isChanged), mapValues(toPatchValue))
  return { ...removals, ...updates }
}

/**
 * Builds the JSON Merge Patch (RFC 7386) that turns one version of an object into another.
 *
 * Use when: an edit form or a client cache holds the original and the edited version, and only
 * what changed should go over the wire in a `PATCH`, be stored as a revision, or be queued for
 * sync. Changed and new keys carry their new value, a removed key (or one set to `undefined`)
 * becomes `null`, and nested objects get a nested patch with only their changes. Arrays and
 * other values are sent whole. No change gives `{}`. Merge patch can't express setting a
 * value to `null`: such a key reads as removed.
 *
 * @example
 * ```ts
 * const saved = { name: 'Ada', bio: 'Math', tags: ['a'], links: { site: 'ada.dev', x: '@ada' } }
 * const edited = { name: 'Ada', tags: ['a', 'b'], links: { site: 'ada.io', x: '@ada' } }
 *
 * createMergePatch(saved, edited)
 * // => { bio: null, tags: ['a', 'b'], links: { site: 'ada.io' } }
 *
 * createMergePatch({ name: 'Ada', nickname: 'A' }, { name: 'Ada', nickname: undefined })
 * // => { nickname: null }
 *
 * createMergePatch(saved, saved)
 * // => {}
 * ```
 *
 * @tags patch, merge patch, rfc7386, diff, changes, http, partial update, dirty fields, sync
 * @see mergePatch - applies the patch, giving `edited` back
 * @see changedValues - the changes with old and new values, for an audit log
 * @see filterValues - @ontologyio/receta/object, keeps the keys whose value changed
 */
export function createMergePatch(before: object, after: object): PlainObject {
  return createPatch(before as PlainObject, after as PlainObject)
}
