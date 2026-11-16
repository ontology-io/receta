import * as R from 'remeda'
import { ascending, compose, descending } from '@ontologyio/receta/compare'

/**
 * Sorts by priority number, most urgent first, and within one priority by date, newest first.
 *
 * Use when: ordering an issue tracker, a support queue or an alert list where priority 1 beats
 * priority 3, and among equal priorities the most recent item matters most. Items with the same
 * priority and date keep their input order. Dates are `Date`s or epoch numbers.
 *
 * @example
 * ```ts
 * const tickets = [
 *   { title: 'typo', priority: 3, openedAt: new Date('2024-05-03') },
 *   { title: 'outage', priority: 1, openedAt: new Date('2024-05-01') },
 *   { title: 'slow page', priority: 2, openedAt: new Date('2024-05-02') },
 *   { title: 'data loss', priority: 1, openedAt: new Date('2024-05-04') },
 * ]
 *
 * R.pipe(
 *   sortByPriorityThenNewest(tickets, (ticket) => ticket.priority, (ticket) => ticket.openedAt),
 *   R.map(R.prop('title')),
 * )
 * // => ['data loss', 'outage', 'slow page', 'typo']
 *
 * const alerts = [{ id: 'a', level: 2, at: 10 }, { id: 'b', level: 2, at: 20 }]
 * R.pipe(alerts, sortByPriorityThenNewest((alert) => alert.level, (alert) => alert.at), R.map(R.prop('id')))
 * // => ['b', 'a']
 * ```
 *
 * @tags sort, priority, urgency, newest, recent, queue, issues, tickets, triage
 * @see sortByCustomOrder - priority given as named levels like 'high' and 'low'
 * @see compose - @ontologyio/receta/compare, chains the two orders
 */
export function sortByPriorityThenNewest<T>(
  items: readonly T[],
  priority: (item: T) => number,
  date: (item: T) => Date | number,
): readonly T[]
export function sortByPriorityThenNewest<T>(
  priority: (item: T) => number,
  date: (item: T) => Date | number,
): (items: readonly T[]) => readonly T[]
export function sortByPriorityThenNewest(...args: unknown[]): unknown {
  return R.purry(sortByPriorityThenNewestImplementation, args)
}

const sortByPriorityThenNewestImplementation = <T>(
  items: readonly T[],
  priority: (item: T) => number,
  date: (item: T) => Date | number,
): readonly T[] => R.sort(items, compose(ascending(priority), descending((item: T) => Number(date(item)))))
