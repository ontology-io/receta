import * as R from 'remeda'
import { insertAt } from '@ontologyio/receta/collection'
import type { Comparator } from '@ontologyio/receta/compare'
import { lte } from '@ontologyio/receta/predicate'

/**
 * Inserts an item into a list that is already sorted, at the place that keeps it sorted.
 *
 * Use when: a new message, event or score arrives for a list kept in order, and sorting the
 * whole list again would be wasteful or would reshuffle equal items. The position is found by
 * binary search. The new item goes after any items it ties with, so arrival order holds among
 * equals. The list must already be sorted by the same comparator.
 *
 * @example
 * ```ts
 * import { ascending, descending } from '@ontologyio/receta/compare'
 *
 * const byStart = ascending((event: { start: number; title: string }) => event.start)
 * const agenda = [
 *   { start: 9, title: 'standup' },
 *   { start: 13, title: 'lunch' },
 *   { start: 16, title: 'review' },
 * ]
 *
 * R.pipe(insertSorted(agenda, { start: 13, title: 'call' }, byStart), R.map(R.prop('title')))
 * // => ['standup', 'lunch', 'call', 'review']
 *
 * R.pipe([30, 20, 10], insertSorted(25, descending((score: number) => score)))
 * // => [30, 25, 20, 10]
 *
 * insertSorted([], 'only', ascending((word: string) => word))
 * // => ['only']
 * ```
 *
 * @tags insert, sorted, ordered, binary search, keep sorted, timeline, priority queue, position
 * @see insertAt - @ontologyio/receta/collection, the insert by position
 * @see ascending - @ontologyio/receta/compare, builds the comparator
 */
export function insertSorted<T>(
  items: readonly NoInfer<T>[],
  item: NoInfer<T>,
  compare: Comparator<T>,
): readonly T[]
export function insertSorted<T>(
  item: NoInfer<T>,
  compare: Comparator<T>,
): (items: readonly T[]) => readonly T[]
export function insertSorted(...args: unknown[]): unknown {
  return R.purry(insertSortedImplementation, args)
}

const isNotAfter = lte(0)

const insertSortedImplementation = <T>(items: readonly T[], item: T, compare: Comparator<T>): readonly T[] =>
  // The first position whose item sorts after the new one: everything before it is equal or smaller.
  insertAt(items, R.sortedIndexWith(items, (existing) => isNotAfter(compare(existing, item))), [item])
