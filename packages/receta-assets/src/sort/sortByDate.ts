import * as R from 'remeda'
import { byNumber } from '@ontologyio/receta/compare'
import { isNullish } from '@ontologyio/receta/predicate'

/**
 * Sorts by a date that may be a `Date`, an ISO string, epoch milliseconds or missing, with bad and missing dates last.
 *
 * Use when: sorting API data whose dates arrive as strings like '2024-05-01T10:00:00Z', where
 * some rows have `null`, an empty string or an unparseable value. Those rows go last in both
 * directions instead of landing at a random spot, since an invalid `Date` makes ordinary
 * comparators return `NaN`. Strings are parsed with `new Date(text)`, so prefer ISO 8601.
 * Equal dates keep their input order.
 *
 * @example
 * ```ts
 * const posts = [
 *   { title: 'draft', publishedAt: null },
 *   { title: 'hello', publishedAt: '2024-01-10T09:00:00Z' },
 *   { title: 'broken', publishedAt: 'soon' },
 *   { title: 'update', publishedAt: '2024-03-02T09:00:00Z' },
 * ]
 *
 * R.pipe(sortByDate(posts, (post) => post.publishedAt, 'desc'), R.map(R.prop('title')))
 * // => ['update', 'hello', 'draft', 'broken']
 *
 * R.pipe(posts, sortByDate((post) => post.publishedAt, 'asc'), R.map(R.prop('title')))
 * // => ['hello', 'update', 'draft', 'broken']
 * ```
 *
 * @tags sort, date, iso, timestamp, newest, oldest, invalid date, missing, null, api, string date
 * @see sortByDateDescThenId - newest first with a tie-break by id
 * @see byNumber - @ontologyio/receta/compare, which puts NaN last
 */
export function sortByDate<T>(
  items: readonly T[],
  date: (item: T) => Date | string | number | null | undefined,
  direction: 'asc' | 'desc',
): readonly T[]
export function sortByDate<T>(
  date: (item: T) => Date | string | number | null | undefined,
  direction: 'asc' | 'desc',
): (items: readonly T[]) => readonly T[]
export function sortByDate(...args: unknown[]): unknown {
  return R.purry(sortByDateImplementation, args)
}

const sortByDateImplementation = <T>(
  items: readonly T[],
  date: (item: T) => Date | string | number | null | undefined,
  direction: 'asc' | 'desc',
): readonly T[] => {
  // A missing or unparseable date becomes NaN, and byNumber sorts NaN after every number.
  const time = (item: T): number => {
    const value = date(item)
    return isNullish(value) || value === '' ? Number.NaN : new Date(value).getTime()
  }
  // Negating flips the order of the numbers but leaves NaN as NaN, so bad dates stay last.
  return R.sort(items, byNumber(direction === 'desc' ? (item: T) => -time(item) : time))
}
