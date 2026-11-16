import * as R from 'remeda'
import { ascending } from '@ontologyio/receta/compare'

/**
 * Sorts items by where their value appears in a given list, with values not in the list last.
 *
 * Use when: the order is a business rule rather than alphabetical, such as statuses in workflow
 * order (todo, doing, done), sizes (S, M, L, XL), severities, or a saved manual order of ids.
 * Values missing from the list go last, in their input order, so a new status never breaks the
 * page. Items with the same value keep their input order.
 *
 * @example
 * ```ts
 * const tasks = [
 *   { title: 'deploy', status: 'done' },
 *   { title: 'review', status: 'doing' },
 *   { title: 'spike', status: 'blocked' },
 *   { title: 'docs', status: 'todo' },
 * ]
 *
 * R.pipe(
 *   sortByCustomOrder(tasks, ['todo', 'doing', 'done'], (task) => task.status),
 *   R.map(R.prop('title')),
 * )
 * // => ['docs', 'review', 'deploy', 'spike']
 *
 * R.pipe(['XL', 'S', 'M', 'S'], sortByCustomOrder(['S', 'M', 'L', 'XL'], R.identity()))
 * // => ['S', 'S', 'M', 'XL']
 * ```
 *
 * @tags sort, custom order, enum, status, workflow, sizes, manual order, explicit order, rank
 * @see sortByPriorityThenNewest - priority as a number plus a date
 * @see ascending - @ontologyio/receta/compare, orders by position in the list
 */
export function sortByCustomOrder<T, V>(items: readonly T[], order: readonly V[], value: (item: T) => V): readonly T[]
export function sortByCustomOrder<T, V>(order: readonly V[], value: (item: T) => V): (items: readonly T[]) => readonly T[]
export function sortByCustomOrder(...args: unknown[]): unknown {
  return R.purry(sortByCustomOrderImplementation, args)
}

const sortByCustomOrderImplementation = <T, V>(
  items: readonly T[],
  order: readonly V[],
  value: (item: T) => V,
): readonly T[] => {
  const positions = new Map(R.map(order, (entry, index) => [entry, index] as const))
  // A value missing from the list sorts after every listed one.
  const position = (item: T): number => positions.get(value(item)) ?? order.length
  return R.sort(items, ascending(position))
}
