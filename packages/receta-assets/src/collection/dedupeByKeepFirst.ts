import * as R from 'remeda'
import { ascending } from '@ontologyio/receta/compare'

export type DedupeByKeepFirstResult<T> = {
  /** One item per key, the first one seen, in input order. */
  readonly kept: readonly T[]
  /** The later copies that were left out, in input order. */
  readonly dropped: readonly T[]
}

/**
 * Removes items whose key was already seen, keeping the first, and returns what it dropped.
 *
 * Use when: importing rows from a CSV or a form where a repeated email, SKU or id should be
 * skipped and reported, as in "2 duplicate rows were skipped". Keys compare as strings, so
 * `1` and `'1'` are the same key. Normalize the key yourself if case or spaces should not
 * matter, such as `(row) => row.email.trim().toLowerCase()`.
 *
 * @example
 * ```ts
 * const rows = [
 *   { email: 'ada@example.com', row: 1 },
 *   { email: 'bob@example.com', row: 2 },
 *   { email: 'ada@example.com', row: 3 },
 * ]
 *
 * dedupeByKeepFirst(rows, (row) => row.email)
 * // => {
 * //   kept: [{ email: 'ada@example.com', row: 1 }, { email: 'bob@example.com', row: 2 }],
 * //   dropped: [{ email: 'ada@example.com', row: 3 }],
 * // }
 *
 * R.pipe(['b', 'a', 'b', 'c', 'a'], dedupeByKeepFirst(R.identity()))
 * // => { kept: ['b', 'a', 'c'], dropped: ['b', 'a'] }
 * ```
 *
 * @tags dedupe, deduplicate, unique, distinct, duplicates, import, csv, first wins
 * @see dedupeByKeepLast - the last copy wins instead
 * @see dedupeByKeepBest - a comparator picks the copy that wins
 * @see ascending - @ontologyio/receta/compare, puts the items back in input order
 */
export function dedupeByKeepFirst<T>(
  items: readonly T[],
  key: (item: T) => string | number,
): DedupeByKeepFirstResult<T>
export function dedupeByKeepFirst<T>(
  key: (item: T) => string | number,
): (items: readonly T[]) => DedupeByKeepFirstResult<T>
export function dedupeByKeepFirst(...args: unknown[]): unknown {
  return R.purry(dedupeByKeepFirstImplementation, args)
}

type Entry<T> = { readonly item: T; readonly index: number }

const inInputOrder = <T>(entries: readonly Entry<T>[]): readonly T[] =>
  R.pipe(
    entries,
    R.sort(ascending((entry: Entry<T>) => entry.index)),
    R.map((entry) => entry.item),
  )

const dedupeByKeepFirstImplementation = <T>(
  items: readonly T[],
  key: (item: T) => string | number,
): DedupeByKeepFirstResult<T> => {
  // Each group lists its copies in input order, so the first copy is the one to keep.
  const groups = R.pipe(
    items,
    R.map((item, index): Entry<T> => ({ item, index })),
    R.groupBy((entry) => key(entry.item)),
    R.values(),
  )
  // groupBy puts integer-like keys first, so the input order comes back from the index.
  return {
    kept: inInputOrder(R.map(groups, R.first())),
    dropped: inInputOrder(R.flatMap(groups, R.drop(1))),
  }
}
