import { by, gte, isFiniteNumber, type Predicate } from '@ontologyio/receta/predicate'

export type IsActiveWithinWindow = {
  /** The current time in milliseconds, passed in so the predicate stays pure. */
  readonly now: number
  /** How far back counts as active, in milliseconds. */
  readonly windowMs: number
}

/**
 * Builds a predicate that keeps items whose last-activity timestamp falls within a recent window.
 *
 * Use when: counting or listing active users, live sessions, recently seen devices or fresh
 * listings, such as "active in the last 30 days". Name the timestamp field, in milliseconds.
 * The window includes its start and runs up to `now`; a timestamp after `now` still counts,
 * since clocks drift. Items never active, with the field missing or `null`, are dropped.
 *
 * @example
 * ```ts
 * const now = Date.UTC(2026, 0, 31)
 * const day = 86_400_000
 * const users = [
 *   { name: 'Ada', lastSeenAt: now - 2 * day },
 *   { name: 'Grace', lastSeenAt: now - 45 * day },
 *   { name: 'Alan', lastSeenAt: null },
 * ]
 *
 * R.map(R.filter(users, isActiveWithin('lastSeenAt', { now, windowMs: 30 * day })), R.prop('name'))
 * // => ['Ada']
 *
 * R.filter(users, isActiveWithin('lastSeenAt', { now, windowMs: 60 * day })).length
 * // => 2
 * ```
 *
 * @tags active, recent, last seen, activity, mau, dau, window, fresh, time, filter
 * @see isWithinTimeRange - a fixed from and to instead of a window back from now
 */
export function isActiveWithin<K extends PropertyKey>(
  key: K,
  window: IsActiveWithinWindow,
): Predicate<{ readonly [P in K]?: number | null | undefined }> {
  const since = gte(window.now - window.windowMs)
  return by((item) => item[key], (timestamp) => isFiniteNumber(timestamp) && since(timestamp))
}
