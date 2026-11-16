import * as R from 'remeda'
import { not, oneOf } from '@ontologyio/receta/predicate'

export type TagChangesResult<T> = {
  /** In `after` but not in `before`, in `after` order. */
  readonly added: readonly T[]
  /** In `before` but not in `after`, in `before` order. */
  readonly removed: readonly T[]
  /** In both, in `after` order. */
  readonly kept: readonly T[]
}

/**
 * Compares two lists of tags, roles or ids and says which were added, removed and kept.
 *
 * Use when: a user edits the tags on a post, the roles of a member or the labels of an issue,
 * and the app must send one "add" and one "remove" call per change, or log them for an audit
 * trail. Each value counts once, however often it repeats. Values compare exactly, so trim
 * and lowercase them first if `'Urgent'` and `'urgent'` are the same tag.
 *
 * @example
 * ```ts
 * tagChanges(['bug', 'ui', 'p2'], ['bug', 'p1', 'ui', 'p1'])
 * // => { added: ['p1'], removed: ['p2'], kept: ['bug', 'ui'] }
 *
 * R.pipe([3, 5], tagChanges([5, 8]))
 * // => { added: [8], removed: [3], kept: [5] }
 * ```
 *
 * @tags tags, labels, roles, permissions, set difference, added, removed, changes, diff, audit
 * @see diffById - the same comparison for records with ids and contents
 * @see oneOf - @ontologyio/receta/predicate, the membership test
 */
export function tagChanges<T extends string | number>(
  before: readonly T[],
  after: readonly T[],
): TagChangesResult<T>
export function tagChanges<T extends string | number>(
  after: readonly T[],
): (before: readonly T[]) => TagChangesResult<T>
export function tagChanges(...args: unknown[]): unknown {
  return R.purry(tagChangesImplementation, args)
}

const tagChangesImplementation = <T extends string | number>(
  before: readonly T[],
  after: readonly T[],
): TagChangesResult<T> => {
  const previous = R.unique(before)
  const next = R.unique(after)
  return {
    added: R.filter(next, not(oneOf(previous))),
    removed: R.filter(previous, not(oneOf(next))),
    kept: R.filter(next, oneOf(previous)),
  }
}
