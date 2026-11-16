import * as R from 'remeda'
import { always, or, type Predicate } from '@ontologyio/receta/predicate'

/**
 * Joins optional filters with OR, skipping absent ones; with none left, every item is kept.
 *
 * Use when: several saved views, quick filters or alert rules may each claim an item, as in
 * "mine OR mentioning me OR overdue", and some of those rules are switched off. `undefined`,
 * `null` and `false` entries are skipped. With no filter switched on, everything is kept, as
 * a filter bar with nothing selected should, rather than nothing as a bare OR would.
 *
 * @example
 * ```ts
 * import { eq, where } from '@ontologyio/receta/predicate'
 *
 * const tasks = [{ owner: 'ada', overdue: false }, { owner: 'alan', overdue: true }, { owner: 'grace', overdue: false }]
 * const showMine = true
 * const showOverdue = true
 *
 * R.filter(tasks, matchesAnyFilter([showMine && where({ owner: eq('ada') }), showOverdue && where({ overdue: Boolean })]))
 * // => [{ owner: 'ada', overdue: false }, { owner: 'alan', overdue: true }]
 *
 * R.filter(tasks, matchesAnyFilter<{ owner: string }>([false, undefined])).length
 * // => 3
 * ```
 *
 * @tags or, any, combine, filters, optional, views, rules, union, query builder
 * @see combineFilters - the same, joined with AND
 * @see or - @ontologyio/receta/predicate, every predicate given, none skipped
 */
export function matchesAnyFilter<T>(filters: readonly (Predicate<T> | false | null | undefined)[]): Predicate<T> {
  const present = R.filter(filters, R.isFunction)
  return R.isEmpty(present) ? always<T>() : or(...present)
}
