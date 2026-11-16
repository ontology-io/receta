import * as R from 'remeda'
import { flatten, type PlainObject } from '@ontologyio/receta/object'
import { not, oneOf } from '@ontologyio/receta/predicate'

export type DiffPathsResult = {
  readonly added: readonly string[]
  readonly removed: readonly string[]
  readonly changed: readonly string[]
}

/**
 * Lists the dot paths that were added, removed or changed between two versions of an object.
 *
 * Use when: deciding what to save, revalidate or announce after an edit, such as "settings
 * changed: theme, notifications.email", or which config keys need a restart. Nested objects
 * are compared leaf by leaf (`address.city`), while an array is one value compared whole.
 * A leaf that turns into an object shows up as the old path removed and the new paths added.
 * `added` and `changed` follow the order of `after`, `removed` the order of `before`.
 *
 * @example
 * ```ts
 * const before = { theme: 'light', notifications: { email: true, sms: false }, tags: ['a'], beta: true }
 * const after = { theme: 'dark', notifications: { email: true, sms: true }, tags: ['a', 'b'], locale: 'de' }
 *
 * diffPaths(before, after)
 * // => { added: ['locale'], removed: ['beta'], changed: ['theme', 'notifications.sms', 'tags'] }
 *
 * diffPaths({ a: { b: 1 } }, { a: { b: 1 } })
 * // => { added: [], removed: [], changed: [] }
 * ```
 *
 * @tags diff, changes, compare, paths, dirty, audit, settings, nested, delta
 * @see changedValues - the same comparison with each old and new value
 * @see createMergePatch - the changes as a patch to send or store
 * @see flatten - @ontologyio/receta/object, turns each side into dot paths
 */
export function diffPaths(before: object, after: object): DiffPathsResult {
  const [old, next] = [flatten(before as PlainObject), flatten(after as PlainObject)]
  const [oldPaths, nextPaths] = [R.keys(old), R.keys(next)]
  const isChanged = (path: string): boolean => !R.isDeepEqual(old[path], next[path])
  return {
    added: R.filter(nextPaths, not(oneOf(oldPaths))),
    removed: R.filter(oldPaths, not(oneOf(nextPaths))),
    changed: R.pipe(nextPaths, R.filter(oneOf(oldPaths)), R.filter(isChanged)),
  }
}
