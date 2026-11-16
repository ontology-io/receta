import { by, gte, isFiniteNumber, type Predicate } from '@ontologyio/receta/predicate'

export type IsAdultAtRules = {
  /** The moment the age is measured at, in milliseconds. Pass it in so the predicate stays pure. */
  readonly now: number
  /** Age to have reached, in whole years. */
  readonly minAge: number
}

/** Whole years between two UTC timestamps, counting a birthday only once it has come. */
const ageAt = (now: number) => (birth: number): number => {
  const born = new Date(birth)
  const today = new Date(now)
  const years = today.getUTCFullYear() - born.getUTCFullYear()
  const monthDay = (date: Date): number => date.getUTCMonth() * 100 + date.getUTCDate()
  return monthDay(today) >= monthDay(born) ? years : years - 1
}

/**
 * Builds a predicate that keeps people who have reached an age on a given day, from their birth date.
 *
 * Use when: an audience, guest list or report must include only people old enough on a
 * date, such as 18 on the event day or 21 today. Name the birth-date field, in milliseconds.
 * Ages are whole years in UTC, and a birthday counts from the start of that day. People
 * without a birth date are dropped.
 *
 * @example
 * ```ts
 * const eventDay = Date.UTC(2026, 6, 4)
 * const guests = [
 *   { name: 'Ada', bornAt: Date.UTC(2008, 6, 4) },
 *   { name: 'Alan', bornAt: Date.UTC(2008, 6, 5) },
 *   { name: 'Grace', bornAt: undefined },
 * ]
 *
 * R.map(R.filter(guests, isAdultAt('bornAt', { now: eventDay, minAge: 18 })), R.prop('name'))
 * // => ['Ada']
 *
 * R.filter(guests, isAdultAt('bornAt', { now: eventDay, minAge: 13 })).length
 * // => 2
 * ```
 *
 * @tags age, adult, birthday, birth date, minimum, 18, 21, audience, eligibility, filter
 * @see validateBirthDate - the same age rule on a form field, with messages
 */
export function isAdultAt<K extends PropertyKey>(
  key: K,
  rules: IsAdultAtRules,
): Predicate<{ readonly [P in K]?: number | null | undefined }> {
  const oldEnough = by(ageAt(rules.now), gte(rules.minAge))
  return by((person) => person[key], (bornAt) => isFiniteNumber(bornAt) && oldEnough(bornAt))
}
