import * as R from 'remeda'
import { ascending } from '@ontologyio/receta/compare'

export type DedupeByKeepLastResult<T> = {
  /** One item per key, the last one seen, in the order those last copies came in. */
  readonly kept: readonly T[]
  /** The earlier copies that were replaced, in input order. */
  readonly dropped: readonly T[]
}

/**
 * Removes items whose key comes again later, keeping the last copy, and returns what it dropped.
 *
 * Use when: a later row should override an earlier one, as when a spreadsheet is uploaded
 * again with corrections, or a change feed sends several versions of one record. Each kept
 * item sits where its last copy stood. Keys compare as strings, so `1` and `'1'` are the
 * same key.
 *
 * @example
 * ```ts
 * const feed = [
 *   { sku: 'A1', stock: 5 },
 *   { sku: 'B2', stock: 0 },
 *   { sku: 'A1', stock: 3 },
 * ]
 *
 * dedupeByKeepLast(feed, (entry) => entry.sku)
 * // => {
 * //   kept: [{ sku: 'B2', stock: 0 }, { sku: 'A1', stock: 3 }],
 * //   dropped: [{ sku: 'A1', stock: 5 }],
 * // }
 *
 * R.pipe(['b', 'a', 'b', 'c', 'a'], dedupeByKeepLast(R.identity()))
 * // => { kept: ['b', 'c', 'a'], dropped: ['b', 'a'] }
 * ```
 *
 * @tags dedupe, deduplicate, unique, distinct, duplicates, override, last wins, latest
 * @see dedupeByKeepFirst - the first copy wins instead
 * @see dedupeByKeepBest - a comparator picks the copy that wins
 * @see ascending - @ontologyio/receta/compare, puts the items back in input order
 */
export function dedupeByKeepLast<T>(
  items: readonly T[],
  key: (item: T) => string | number,
): DedupeByKeepLastResult<T>
export function dedupeByKeepLast<T>(
  key: (item: T) => string | number,
): (items: readonly T[]) => DedupeByKeepLastResult<T>
export function dedupeByKeepLast(...args: unknown[]): unknown {
  return R.purry(dedupeByKeepLastImplementation, args)
}

type Entry<T> = { readonly item: T; readonly index: number }

const inInputOrder = <T>(entries: readonly Entry<T>[]): readonly T[] =>
  R.pipe(
    entries,
    R.sort(ascending((entry: Entry<T>) => entry.index)),
    R.map((entry) => entry.item),
  )

const dedupeByKeepLastImplementation = <T>(
  items: readonly T[],
  key: (item: T) => string | number,
): DedupeByKeepLastResult<T> => {
  // Each group lists its copies in input order, so the last copy is the one to keep.
  const groups = R.pipe(
    items,
    R.map((item, index): Entry<T> => ({ item, index })),
    R.groupBy((entry) => key(entry.item)),
    R.values(),
  )
  // groupBy puts integer-like keys first, so the input order comes back from the index.
  return {
    kept: inInputOrder(R.map(groups, R.last())),
    dropped: inInputOrder(R.flatMap(groups, R.dropLast(1))),
  }
}
