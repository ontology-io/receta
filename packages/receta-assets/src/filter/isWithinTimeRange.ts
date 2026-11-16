import * as R from 'remeda'
import { always, and, by, gte, isFiniteNumber, lt, type Predicate } from '@ontologyio/receta/predicate'

export type IsWithinTimeRangeBounds = {
  /** First moment kept, inclusive, in milliseconds. Open when absent. */
  readonly from?: number | undefined
  /** First moment no longer kept, exclusive, in milliseconds. Open when absent. */
  readonly to?: number | undefined
}

/**
 * Builds a predicate for timestamps in a half-open range, `from` included and `to` left out.
 *
 * Use when: a log viewer, activity feed or report shows events "from Monday to Sunday" or "in
 * March", and back-to-back ranges must not count an event at midnight twice. Name the
 * timestamp field, in milliseconds. Either bound may be absent. Items without a timestamp
 * are dropped once a bound is set.
 *
 * @example
 * ```ts
 * const march = { from: Date.UTC(2026, 2, 1), to: Date.UTC(2026, 3, 1) }
 * const events = [
 *   { name: 'deploy', at: Date.UTC(2026, 2, 31, 23, 59) },
 *   { name: 'outage', at: Date.UTC(2026, 3, 1) },
 *   { name: 'audit', at: Date.UTC(2026, 1, 10) },
 * ]
 *
 * R.map(R.filter(events, isWithinTimeRange('at', march)), R.prop('name'))
 * // => ['deploy']
 *
 * R.map(R.filter(events, isWithinTimeRange('at', { from: Date.UTC(2026, 2, 1) })), R.prop('name'))
 * // => ['deploy', 'outage']
 * ```
 *
 * @tags time, date, range, period, from, to, between, logs, events, report, filter
 * @see isActiveWithin - a window back from now
 * @see withinRange - any number range, both ends inclusive
 */
export function isWithinTimeRange<K extends PropertyKey>(
  key: K,
  bounds: IsWithinTimeRangeBounds,
): Predicate<{ readonly [P in K]?: number | null | undefined }> {
  const limits = [
    ...(bounds.from === undefined ? [] : [gte(bounds.from)]),
    ...(bounds.to === undefined ? [] : [lt(bounds.to)]),
  ]
  if (R.isEmpty(limits)) return always()
  const inRange = and(...limits)
  return by((item) => item[key], (timestamp) => isFiniteNumber(timestamp) && inRange(timestamp))
}
