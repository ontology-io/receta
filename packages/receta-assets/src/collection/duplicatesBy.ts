import * as R from 'remeda'
import { by, gt } from '@ontologyio/receta/predicate'

export type DuplicatesByGroup<T> = {
  readonly key: string | number
  /** Every item with the key, in input order. Always two or more. */
  readonly items: readonly T[]
}

/**
 * Finds the keys that more than one item shares, with all the items that share each one.
 *
 * Use when: validating an import or a form list before saving, to tell the user "these 3 rows
 * use the same email", or auditing data for repeated SKUs or slugs. Groups come in the order
 * their key first appears. Keys compare as strings, so `1` and `'1'` are the same key; trim or
 * lowercase in `key` when that should count too.
 *
 * @example
 * ```ts
 * const rows = [
 *   { row: 1, email: 'ana@example.com' },
 *   { row: 2, email: 'bo@example.com' },
 *   { row: 3, email: 'ANA@example.com' },
 * ]
 *
 * duplicatesBy(rows, (row) => row.email.toLowerCase())
 * // => [{
 * //   key: 'ana@example.com',
 * //   items: [{ row: 1, email: 'ana@example.com' }, { row: 3, email: 'ANA@example.com' }],
 * // }]
 *
 * R.pipe(['b', 'a', 'b', 'c', 'a', 'b'], duplicatesBy(R.identity()), R.map(R.prop('key')))
 * // => ['b', 'a']
 *
 * duplicatesBy([1, 2, 3], R.identity())
 * // => []
 * ```
 *
 * @tags duplicates, repeated, collisions, validate, import, unique, conflicts, find duplicates
 * @see dedupeByKeepFirst - removes the repeats instead of listing them
 * @see indexByIdStrict - fails on repeated ids while building a lookup
 */
export function duplicatesBy<T>(items: readonly T[], key: (item: T) => string | number): readonly DuplicatesByGroup<T>[]
export function duplicatesBy<T>(
  key: (item: T) => string | number,
): (items: readonly T[]) => readonly DuplicatesByGroup<T>[]
export function duplicatesBy(...args: unknown[]): unknown {
  return R.purry(duplicatesByImplementation, args)
}

const duplicatesByImplementation = <T>(
  items: readonly T[],
  key: (item: T) => string | number,
): readonly DuplicatesByGroup<T>[] => {
  const groups = R.groupBy(items, (item) => String(key(item)))
  // groupBy puts integer-like keys first, so walk the keys in input order instead.
  return R.pipe(
    items,
    R.map(key),
    R.uniqueBy(String),
    R.map((value) => ({ key: value, items: groups[String(value)] ?? [] })),
    R.filter(by((group) => group.items.length, gt(1))),
  )
}
