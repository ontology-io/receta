import * as R from 'remeda'
import { byBoolean, byNumber, compose } from '@ontologyio/receta/compare'
import { isNullish } from '@ontologyio/receta/predicate'

/**
 * Sorts tasks the way a to-do list should: open tasks by due date, soonest first, then open tasks with no due date, then done ones.
 *
 * Use when: showing a task list, a reading list or follow-ups, where overdue items must surface
 * first and finished items sink. Overdue tasks come first simply because their dates are the
 * earliest. Done tasks follow the same order among themselves. Tasks with the same due date keep
 * their input order. Due dates are `Date`s or epoch numbers, or `null`/`undefined` when unset.
 *
 * @example
 * ```ts
 * const tasks = [
 *   { title: 'file taxes', due: new Date('2024-04-15'), done: false },
 *   { title: 'call mom', due: null, done: false },
 *   { title: 'renew passport', due: new Date('2024-03-01'), done: false },
 *   { title: 'book flights', due: new Date('2024-02-01'), done: true },
 * ]
 *
 * R.pipe(sortByDueDate(tasks, (task) => task.due, (task) => task.done), R.map(R.prop('title')))
 * // => ['renew passport', 'file taxes', 'call mom', 'book flights']
 *
 * const chores = [{ name: 'a', due: undefined, done: true }, { name: 'b', due: 5, done: true }]
 * R.pipe(chores, sortByDueDate((chore) => chore.due, (chore) => chore.done), R.map(R.prop('name')))
 * // => ['b', 'a']
 * ```
 *
 * @tags sort, due date, deadline, tasks, todo, overdue, done last, checklist, reminders
 * @see sortNullsLast - any nullable field with missing values last
 * @see byBoolean - @ontologyio/receta/compare, open before done and dated before undated
 */
export function sortByDueDate<T>(
  items: readonly T[],
  due: (item: T) => Date | number | null | undefined,
  isDone: (item: T) => boolean,
): readonly T[]
export function sortByDueDate<T>(
  due: (item: T) => Date | number | null | undefined,
  isDone: (item: T) => boolean,
): (items: readonly T[]) => readonly T[]
export function sortByDueDate(...args: unknown[]): unknown {
  return R.purry(sortByDueDateImplementation, args)
}

const sortByDueDateImplementation = <T>(
  items: readonly T[],
  due: (item: T) => Date | number | null | undefined,
  isDone: (item: T) => boolean,
): readonly T[] => {
  const hasNoDueDate = (item: T): boolean => isNullish(due(item))
  // Number(null) is 0, but the comparisons before this one already set undated tasks apart.
  const dueTime = (item: T): number => Number(due(item))
  // byBoolean puts false first: open before done, then dated before undated.
  return R.sort(items, compose(byBoolean(isDone), byBoolean(hasNoDueDate), byNumber(dueTime)))
}
