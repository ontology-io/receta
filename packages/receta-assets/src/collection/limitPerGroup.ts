import * as R from 'remeda'
import { ascending } from '@ontologyio/receta/compare'

/**
 * Keeps at most `max` items per key, dropping the rest, and leaves the survivors in input order.
 *
 * Use when: diversifying search results to at most 2 products per seller, showing 3 posts per
 * author in a feed, or capping notifications per type. Within each key the earliest items stay,
 * so sort the list by relevance first. A `max` of 0 or less returns an empty list.
 *
 * @example
 * ```ts
 * const results = [
 *   { title: 'Desk A', seller: 'acme' },
 *   { title: 'Desk B', seller: 'acme' },
 *   { title: 'Desk C', seller: 'acme' },
 *   { title: 'Desk D', seller: 'oakly' },
 *   { title: 'Desk E', seller: 'acme' },
 * ]
 *
 * R.pipe(limitPerGroup(results, (result) => result.seller, 2), R.map(R.prop('title')))
 * // => ['Desk A', 'Desk B', 'Desk D']
 *
 * R.pipe(['x', 'y', 'x', 'x', 'y'], limitPerGroup(R.identity(), 1))
 * // => ['x', 'y']
 * ```
 *
 * @tags limit, cap, per group, diversify, max per key, quota, feed, search results, throttle
 * @see dedupeByKeepFirst - the same with a limit of one, and what was dropped
 * @see ascending - @ontologyio/receta/compare, puts the survivors back in input order
 */
export function limitPerGroup<T>(items: readonly T[], key: (item: T) => string | number, max: number): readonly T[]
export function limitPerGroup<T>(key: (item: T) => string | number, max: number): (items: readonly T[]) => readonly T[]
export function limitPerGroup(...args: unknown[]): unknown {
  return R.purry(limitPerGroupImplementation, args)
}

type Entry<T> = { readonly item: T; readonly index: number }

const limitPerGroupImplementation = <T>(
  items: readonly T[],
  key: (item: T) => string | number,
  max: number,
): readonly T[] =>
  R.pipe(
    items,
    R.map((item, index): Entry<T> => ({ item, index })),
    R.groupBy((entry) => key(entry.item)),
    R.values(),
    R.flatMap(R.take(Math.max(0, max))),
    // groupBy puts integer-like keys first, so the input order comes back from the index.
    R.sort(ascending((entry: Entry<T>) => entry.index)),
    R.map((entry) => entry.item),
  )
