import * as R from 'remeda'
import { byKey, compose, reverse, type Comparator } from '@ontologyio/receta/compare'

export type SortByKeysRule<T> = {
  readonly key: keyof T
  /** Defaults to `'asc'`. */
  readonly direction?: 'asc' | 'desc'
}

/**
 * Sorts by several fields in turn, each ascending or descending, like SQL's `ORDER BY a, b DESC`.
 *
 * Use when: the order comes from data rather than code, such as a saved view, a report
 * definition or a "sort by" menu with a secondary sort, written as `[{ key, direction }]`. Later
 * rules only decide between items the earlier rules found equal, and items equal on every rule
 * keep their input order. An empty list of rules keeps the input order. Fields should hold
 * numbers, strings or dates; strings compare by code unit.
 *
 * @example
 * ```ts
 * const staff = [
 *   { name: 'cy', team: 'web', salary: 70 },
 *   { name: 'ana', team: 'api', salary: 90 },
 *   { name: 'bo', team: 'web', salary: 85 },
 *   { name: 'di', team: 'api', salary: 90 },
 * ]
 *
 * R.pipe(
 *   sortByKeys(staff, [{ key: 'team' }, { key: 'salary', direction: 'desc' }, { key: 'name' }]),
 *   R.map(R.prop('name')),
 * )
 * // => ['ana', 'di', 'bo', 'cy']
 *
 * R.pipe(staff, sortByKeys([]), R.map(R.prop('name')))
 * // => ['cy', 'ana', 'bo', 'di']
 * ```
 *
 * @tags sort, order by, multi-key, multiple fields, secondary sort, tie-breaker, saved view, config
 * @see sortByColumn - one user-chosen column with blanks last and natural text
 * @see compose - @ontologyio/receta/compare, chains the rules
 */
export function sortByKeys<T>(items: readonly T[], rules: readonly SortByKeysRule<NoInfer<T>>[]): readonly T[]
export function sortByKeys<T>(rules: readonly SortByKeysRule<T>[]): (items: readonly T[]) => readonly T[]
export function sortByKeys(...args: unknown[]): unknown {
  return R.purry(sortByKeysImplementation, args)
}

const toComparator = <T>({ key, direction = 'asc' }: SortByKeysRule<T>): Comparator<T> =>
  direction === 'desc' ? reverse(byKey<T, keyof T>(key)) : byKey<T, keyof T>(key)

const sortByKeysImplementation = <T>(items: readonly T[], rules: readonly SortByKeysRule<T>[]): readonly T[] =>
  R.sort(items, compose(...R.map(rules, toComparator<T>)))
