import { and, between, by, isFiniteNumber, isNullish, type Predicate } from '@ontologyio/receta/predicate'

export type IsDueWithinRules<Due extends PropertyKey, Done extends PropertyKey> = {
  /** The field holding the due time, in milliseconds. */
  readonly due: Due
  /** The field set once the item is finished, such as `paidAt` or `completedAt`. Filled means done. */
  readonly done?: Done
  /** The current time in milliseconds, passed in so the predicate stays pure. */
  readonly now: number
  /** How far ahead counts as due soon, in milliseconds. */
  readonly windowMs: number
}

/** An item with a due time, and optionally a field that is filled once it is done. */
export type IsDueWithinItem<Due extends PropertyKey, Done extends PropertyKey> = {
  readonly [P in Due]?: number | null | undefined
} & { readonly [P in Done]?: unknown }

/**
 * Builds a predicate that keeps unfinished items due between now and the end of a window ahead.
 *
 * Use when: sending "due in 3 days" reminders, showing an "upcoming" column, or warning about
 * renewals, certificates or trials that end soon. Both ends of the window are included, and
 * items already late are left out. If you name a `done` field, finished items are left out
 * too. Items without a due time are never due.
 *
 * @example
 * ```ts
 * const now = Date.UTC(2026, 2, 10)
 * const day = 86_400_000
 * const tasks = [
 *   { title: 'Renew TLS', dueAt: now + 2 * day, completedAt: null },
 *   { title: 'File taxes', dueAt: now + 20 * day, completedAt: null },
 *   { title: 'Pay rent', dueAt: now - day, completedAt: null },
 *   { title: 'Book venue', dueAt: now + day, completedAt: now - day },
 * ]
 *
 * R.map(R.filter(tasks, isDueWithin({ due: 'dueAt', done: 'completedAt', now, windowMs: 3 * day })), R.prop('title'))
 * // => ['Renew TLS']
 *
 * R.filter(tasks, isDueWithin({ due: 'dueAt', now, windowMs: 30 * day })).length
 * // => 3
 * ```
 *
 * @tags due soon, upcoming, deadline, reminder, renewal, expiring, window, task, filter
 * @see isOverdue - due time already passed
 */
export function isDueWithin<Due extends PropertyKey, Done extends PropertyKey = never>(
  rules: IsDueWithinRules<Due, Done>,
): Predicate<IsDueWithinItem<Due, Done>> {
  const soon = between(rules.now, rules.now + rules.windowMs)
  type Item = IsDueWithinItem<Due, Done>
  const dueSoon = by((item: Item) => item[rules.due], (dueAt) => isFiniteNumber(dueAt) && soon(dueAt))
  const { done } = rules
  if (done === undefined) return dueSoon
  return and<Item>(dueSoon, by((item: Item) => item[done], isNullish))
}
