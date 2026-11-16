import * as R from 'remeda'
import { flatten, type PlainObject } from '@ontologyio/receta/object'
import { not, oneOf } from '@ontologyio/receta/predicate'

/** One entry per changed dot path. `from` is undefined for an added path, `to` for a removed one. */
export type ChangedValuesResult = Readonly<Record<string, { readonly from: unknown; readonly to: unknown }>>

/**
 * Lists each dot path that differs between two versions of an object, with its old and new value.
 *
 * Use when: writing an audit log or activity feed entry such as "price: 10 → 12", showing a
 * review screen before saving, or sending a change event. Nested objects are compared leaf by
 * leaf, an array is one value compared whole, and unchanged paths are left out. A path only
 * in `after` has `from: undefined`, one only in `before` has `to: undefined`. Paths of `after`
 * come first, in its order, then the removed ones.
 *
 * @example
 * ```ts
 * const before = { title: 'Desk', price: 10, stock: { warehouse: 4 }, discontinued: false }
 * const after = { title: 'Desk', price: 12, stock: { warehouse: 3 }, color: 'oak' }
 *
 * changedValues(before, after)
 * // => {
 * //   price: { from: 10, to: 12 },
 * //   'stock.warehouse': { from: 4, to: 3 },
 * //   color: { from: undefined, to: 'oak' },
 * //   discontinued: { from: false, to: undefined },
 * // }
 *
 * changedValues({ tags: ['a'] }, { tags: ['a'] })
 * // => {}
 * ```
 *
 * @tags audit, changelog, diff, history, activity, compare, before after, track changes
 * @see diffPaths - only the paths, split into added, removed and changed
 * @see createMergePatch - the changes as a patch to send or store
 * @see flatten - @ontologyio/receta/object, turns each side into dot paths
 */
export function changedValues(before: object, after: object): ChangedValuesResult {
  const [old, next] = [flatten(before as PlainObject), flatten(after as PlainObject)]
  const nextPaths = R.keys(next)
  const paths = [...nextPaths, ...R.filter(R.keys(old), not(oneOf(nextPaths)))]
  const isChanged = (path: string): boolean => !R.isDeepEqual(old[path], next[path])
  return R.pipe(
    paths,
    R.filter(isChanged),
    R.map((path) => [path, { from: old[path], to: next[path] }] as const),
    R.fromEntries(),
  )
}
