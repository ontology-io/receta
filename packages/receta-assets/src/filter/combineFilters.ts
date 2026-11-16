import * as R from 'remeda'
import { and, type Predicate } from '@ontologyio/receta/predicate'

/**
 * Joins optional filters with AND, skipping the ones that are absent, so unset filters don't filter.
 *
 * Use when: a list screen builds its filter from controls that may be empty, such as a search
 * box, a status picker and a date range, and writing `query ? matches(query) : undefined` for
 * each is natural. `undefined`, `null` and `false` entries are skipped, so `cond && filter`
 * works too. With nothing left, every item is kept.
 *
 * @example
 * ```ts
 * import { gt, where } from '@ontologyio/receta/predicate'
 *
 * const orders = [{ total: 20, paid: true }, { total: 80, paid: false }, { total: 120, paid: true }]
 * const onlyPaid = true
 * const minTotal: number | undefined = undefined
 *
 * R.filter(orders, combineFilters([onlyPaid && where({ paid: Boolean }), minTotal === undefined ? undefined : where({ total: gt(minTotal) })]))
 * // => [{ total: 20, paid: true }, { total: 120, paid: true }]
 *
 * R.filter(orders, combineFilters<{ total: number }>([undefined, null, false])).length
 * // => 3
 * ```
 *
 * @tags combine, and, compose, filters, optional, conditional, all, query builder
 * @see matchesAnyFilter - the same, joined with OR
 * @see and - @ontologyio/receta/predicate, every predicate given, none skipped
 */
export function combineFilters<T>(filters: readonly (Predicate<T> | false | null | undefined)[]): Predicate<T> {
  return and(...R.filter(filters, R.isFunction))
}
