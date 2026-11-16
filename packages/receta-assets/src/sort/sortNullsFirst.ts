import * as R from 'remeda'
import { ascending, nullsFirst, reverse, type Nullable } from '@ontologyio/receta/compare'

/**
 * Sorts by a field that may be `null` or `undefined`, with the missing values first in both directions.
 *
 * Use when: the missing value is the one to act on, such as leads never contacted, invoices
 * without a sent date, or records never reviewed, as SQL's `NULLS FIRST` does. Reversing an
 * ordinary comparator would move the missing values to the end; this keeps them at the front
 * either way. Equal values, and the missing ones, keep their input order.
 *
 * @example
 * ```ts
 * const leads = [
 *   { name: 'acme', contactedAt: new Date('2024-03-02') },
 *   { name: 'globex', contactedAt: null },
 *   { name: 'initech', contactedAt: new Date('2024-01-15') },
 * ]
 *
 * R.pipe(sortNullsFirst(leads, (lead) => lead.contactedAt, 'asc'), R.map(R.prop('name')))
 * // => ['globex', 'initech', 'acme']
 *
 * R.pipe(leads, sortNullsFirst((lead) => lead.contactedAt, 'desc'), R.map(R.prop('name')))
 * // => ['globex', 'acme', 'initech']
 * ```
 *
 * @tags sort, nulls first, missing, optional, nullable, undefined, never, order by
 * @see sortNullsLast - the missing values last instead
 * @see nullsFirst - @ontologyio/receta/compare, the comparator underneath
 */
export function sortNullsFirst<T, V extends number | string | Date>(
  items: readonly T[],
  value: (item: T) => Nullable<V>,
  direction: 'asc' | 'desc',
): readonly T[]
export function sortNullsFirst<T, V extends number | string | Date>(
  value: (item: T) => Nullable<V>,
  direction: 'asc' | 'desc',
): (items: readonly T[]) => readonly T[]
export function sortNullsFirst(...args: unknown[]): unknown {
  return R.purry(sortNullsFirstImplementation, args)
}

const sortNullsFirstImplementation = <T, V extends number | string | Date>(
  items: readonly T[],
  value: (item: T) => Nullable<V>,
  direction: 'asc' | 'desc',
): readonly T[] => {
  // nullsFirst never hands null or undefined to the inner comparator, though its type says it may.
  const present = ascending((present: Nullable<V>) => present as V)
  // Reversing inside nullsFirst flips the values but leaves the missing ones at the front.
  const compareValues = nullsFirst(direction === 'desc' ? reverse(present) : present)
  return R.sort(items, (a, b) => compareValues(value(a), value(b)))
}
