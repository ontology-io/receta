import * as R from 'remeda'
import { ascending, compose, descending } from '@ontologyio/receta/compare'

/**
 * Sorts newest first and breaks equal timestamps by id, so the order is total and the same on every run.
 *
 * Use when: paging a feed, an audit log or orders with a cursor, where many rows share a
 * timestamp (bulk imports, second-precision clocks) and a page boundary falling between them
 * would repeat or skip rows. Pair it with a cursor of `(date, id)`. Ids compare as numbers or
 * by code unit, so use one id type per list.
 *
 * @example
 * ```ts
 * const orders = [
 *   { id: 'o3', placedAt: new Date('2024-06-01T10:00:00Z') },
 *   { id: 'o1', placedAt: new Date('2024-06-01T12:00:00Z') },
 *   { id: 'o2', placedAt: new Date('2024-06-01T10:00:00Z') },
 * ]
 *
 * R.pipe(
 *   sortByDateDescThenId(orders, (order) => order.placedAt, (order) => order.id),
 *   R.map(R.prop('id')),
 * )
 * // => ['o1', 'o2', 'o3']
 *
 * const rows = [{ id: 9, at: 5 }, { id: 4, at: 5 }, { id: 7, at: 5 }]
 * R.pipe(rows, sortByDateDescThenId((row) => row.at, (row) => row.id), R.map(R.prop('id')))
 * // => [4, 7, 9]
 * ```
 *
 * @tags sort, newest, timestamp, tie-breaker, stable, deterministic, cursor, keyset, pagination, feed
 * @see sortByDate - newest or oldest first with invalid and missing dates last
 * @see compose - @ontologyio/receta/compare, chains the date and the id
 */
export function sortByDateDescThenId<T>(
  items: readonly T[],
  date: (item: T) => Date | number,
  id: (item: T) => string | number,
): readonly T[]
export function sortByDateDescThenId<T>(
  date: (item: T) => Date | number,
  id: (item: T) => string | number,
): (items: readonly T[]) => readonly T[]
export function sortByDateDescThenId(...args: unknown[]): unknown {
  return R.purry(sortByDateDescThenIdImplementation, args)
}

const sortByDateDescThenIdImplementation = <T>(
  items: readonly T[],
  date: (item: T) => Date | number,
  id: (item: T) => string | number,
): readonly T[] => R.sort(items, compose(descending((item: T) => Number(date(item))), ascending(id)))
