import { and, by, gt, isFiniteNumber, lte, type Predicate } from '@ontologyio/receta/predicate'

export type IsLiveAtRules<Start extends PropertyKey, End extends PropertyKey> = {
  /** The moment to check, in milliseconds. Pass it in so the predicate stays pure. */
  readonly now: number
  /** The field holding when the item goes live. Empty means it already is. */
  readonly start: Start
  /** The field holding when the item stops. Empty means it never does. */
  readonly end: End
}

/** An item with an optional start and end time, in milliseconds. */
export type IsLiveAtItem<Start extends PropertyKey, End extends PropertyKey> = {
  readonly [P in Start]?: number | null | undefined
} & { readonly [P in End]?: number | null | undefined }

/**
 * Builds a predicate for scheduled content that is live at a moment: started, and not yet ended.
 *
 * Use when: showing banners, promotions, announcements, job posts or prices that have a
 * publish and an expiry time, and some leave one of them open. The start is included and the
 * end is not, so a sale ending at midnight is over at midnight. An empty start means already
 * live; an empty end means it never expires.
 *
 * @example
 * ```ts
 * const now = Date.UTC(2026, 10, 27, 12)
 * const banners = [
 *   { id: 'black-friday', startsAt: Date.UTC(2026, 10, 27), endsAt: Date.UTC(2026, 10, 28) },
 *   { id: 'cyber-monday', startsAt: Date.UTC(2026, 10, 30), endsAt: Date.UTC(2026, 11, 1) },
 *   { id: 'free-shipping', startsAt: null, endsAt: null },
 *   { id: 'summer', startsAt: Date.UTC(2026, 5, 1), endsAt: Date.UTC(2026, 8, 1) },
 * ]
 *
 * R.map(R.filter(banners, isLiveAt({ now, start: 'startsAt', end: 'endsAt' })), R.prop('id'))
 * // => ['black-friday', 'free-shipping']
 *
 * R.map(R.filter(banners, isLiveAt({ now: Date.UTC(2026, 10, 28), start: 'startsAt', end: 'endsAt' })), R.prop('id'))
 * // => ['free-shipping']
 * ```
 *
 * @tags scheduled, publish, expire, live, active, window, promotion, banner, campaign, filter
 * @see isWithinTimeRange - a timestamp inside a fixed range
 */
export function isLiveAt<Start extends PropertyKey, End extends PropertyKey>(
  rules: IsLiveAtRules<Start, End>,
): Predicate<IsLiveAtItem<Start, End>> {
  const started = lte(rules.now)
  const notEnded = gt(rules.now)
  return and(
    by((item: IsLiveAtItem<Start, End>) => item[rules.start], (startsAt) => !isFiniteNumber(startsAt) || started(startsAt)),
    by((item: IsLiveAtItem<Start, End>) => item[rules.end], (endsAt) => !isFiniteNumber(endsAt) || notEnded(endsAt)),
  )
}
