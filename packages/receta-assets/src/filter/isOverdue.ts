import { and, by, isFiniteNumber, isNullish, lt, type Predicate } from '@ontologyio/receta/predicate'

export type IsOverdueRules<Due extends PropertyKey, Done extends PropertyKey> = {
  /** The field holding the due time, in milliseconds. */
  readonly due: Due
  /** The field set once the item is finished, such as `paidAt` or `completedAt`. Filled means done. */
  readonly done?: Done
  /** The current time in milliseconds, passed in so the predicate stays pure. */
  readonly now: number
  /** How long after the due time an item still isn't overdue. Defaults to 0. */
  readonly graceMs?: number
}

/** An item with a due time, and optionally a field that is filled once it is done. */
export type IsOverdueItem<Due extends PropertyKey, Done extends PropertyKey> = {
  readonly [P in Due]?: number | null | undefined
} & { readonly [P in Done]?: unknown }

/**
 * Builds a predicate that keeps unfinished items whose due time has passed, with an optional grace period.
 *
 * Use when: listing late invoices, overdue tasks, expired trials awaiting action or library
 * loans not returned, for a dashboard, a reminder job or a dunning email. An item is overdue
 * when its due time plus the grace is before `now` and, if you name a `done` field, that field
 * is empty. Items without a due time are never overdue.
 *
 * @example
 * ```ts
 * const now = Date.UTC(2026, 2, 10)
 * const day = 86_400_000
 * const invoices = [
 *   { id: 'in_1', dueAt: now - 5 * day, paidAt: null },
 *   { id: 'in_2', dueAt: now - 5 * day, paidAt: now - 6 * day },
 *   { id: 'in_3', dueAt: now - 1 * day, paidAt: null },
 *   { id: 'in_4', dueAt: null, paidAt: null },
 * ]
 *
 * R.map(R.filter(invoices, isOverdue({ due: 'dueAt', done: 'paidAt', now })), R.prop('id'))
 * // => ['in_1', 'in_3']
 *
 * R.map(R.filter(invoices, isOverdue({ due: 'dueAt', done: 'paidAt', now, graceMs: 3 * day })), R.prop('id'))
 * // => ['in_1']
 * ```
 *
 * @tags overdue, late, due date, deadline, invoice, task, reminder, dunning, expired, filter
 * @see isDueWithin - due soon, not yet late
 */
export function isOverdue<Due extends PropertyKey, Done extends PropertyKey = never>(
  rules: IsOverdueRules<Due, Done>,
): Predicate<IsOverdueItem<Due, Done>> {
  const late = lt(rules.now - (rules.graceMs ?? 0))
  type Item = IsOverdueItem<Due, Done>
  const pastDue = by((item: Item) => item[rules.due], (dueAt) => isFiniteNumber(dueAt) && late(dueAt))
  const { done } = rules
  if (done === undefined) return pastDue
  return and<Item>(pastDue, by((item: Item) => item[done], isNullish))
}
