import * as R from 'remeda'
import { ascending, nullsLast, reverse, type Nullable } from '@ontologyio/receta/compare'

/**
 * Sorts by a field that may be `null` or `undefined`, with the missing values last in both directions.
 *
 * Use when: sorting customers by last order date where some never ordered, tasks by an optional
 * estimate, or products by a price that isn't set yet, as SQL's `NULLS LAST` does. Reversing
 * an ordinary comparator would move the missing values to the front; this keeps them at the
 * end either way. Equal values, and the missing ones, keep their input order. Strings compare
 * by code unit; use `sortByColumn` for natural text order.
 *
 * @example
 * ```ts
 * const customers = [
 *   { name: 'ana', lastOrder: 30 },
 *   { name: 'bo', lastOrder: null },
 *   { name: 'cy', lastOrder: 45 },
 *   { name: 'di', lastOrder: undefined },
 * ]
 *
 * R.pipe(sortNullsLast(customers, (customer) => customer.lastOrder, 'desc'), R.map(R.prop('name')))
 * // => ['cy', 'ana', 'bo', 'di']
 *
 * R.pipe(customers, sortNullsLast((customer) => customer.lastOrder, 'asc'), R.map(R.prop('name')))
 * // => ['ana', 'cy', 'bo', 'di']
 * ```
 *
 * @tags sort, nulls last, missing, optional, nullable, undefined, empty, order by
 * @see sortNullsFirst - the missing values first instead
 * @see nullsLast - @ontologyio/receta/compare, the comparator underneath
 */
export function sortNullsLast<T, V extends number | string | Date>(
  items: readonly T[],
  value: (item: T) => Nullable<V>,
  direction: 'asc' | 'desc',
): readonly T[]
export function sortNullsLast<T, V extends number | string | Date>(
  value: (item: T) => Nullable<V>,
  direction: 'asc' | 'desc',
): (items: readonly T[]) => readonly T[]
export function sortNullsLast(...args: unknown[]): unknown {
  return R.purry(sortNullsLastImplementation, args)
}

const sortNullsLastImplementation = <T, V extends number | string | Date>(
  items: readonly T[],
  value: (item: T) => Nullable<V>,
  direction: 'asc' | 'desc',
): readonly T[] => {
  // nullsLast never hands null or undefined to the inner comparator, though its type says it may.
  const present = ascending((present: Nullable<V>) => present as V)
  // Reversing inside nullsLast flips the values but leaves the missing ones at the end.
  const compareValues = nullsLast(direction === 'desc' ? reverse(present) : present)
  return R.sort(items, (a, b) => compareValues(value(a), value(b)))
}
