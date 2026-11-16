import * as R from 'remeda'
import { always, between, by, gte } from '@ontologyio/receta/predicate'
import { finite, flatMap, fromPredicate, isValid, schema, type FieldError, type Validation } from '@ontologyio/receta/validation'

export type ValidateBookingRangeInput = {
  /** Check-in day, in milliseconds since the epoch. Any time on that day works. */
  readonly checkIn: number
  /** Check-out day, in milliseconds since the epoch. */
  readonly checkOut: number
}

export type ValidateBookingRangeRules = {
  /** The current time in milliseconds, passed in so the check stays pure. */
  readonly now: number
  /** Fewest nights allowed. */
  readonly minNights: number
  /** Most nights allowed. */
  readonly maxNights: number
}

const DAY_MS = 86_400_000

/** The UTC day a timestamp falls on, counted from the epoch. */
const dayOf = (timestamp: number): number => Math.floor(timestamp / DAY_MS)

/**
 * Checks a stay's check-in and check-out days: not in the past, and a number of nights within limits.
 *
 * Use when: a hotel, rental, parking or equipment booking form takes two dates and must refuse
 * a past check-in, a zero-night stay or one longer than allowed, with each message under its
 * field. Days are UTC calendar days, so times of day are ignored and today is a valid check-in.
 * Nights are only counted once both dates are valid and check-in isn't in the past.
 *
 * @example
 * ```ts
 * const rules = { now: Date.UTC(2026, 6, 1, 15), minNights: 2, maxNights: 14 }
 *
 * validateBookingRange({ checkIn: Date.UTC(2026, 6, 1), checkOut: Date.UTC(2026, 6, 4) }, rules)
 * // => Valid({ checkIn: 1782864000000, checkOut: 1783123200000 })
 *
 * validateBookingRange({ checkIn: Date.UTC(2026, 5, 30), checkOut: Date.UTC(2026, 6, 1) }, rules)
 * // => Invalid([{ field: 'checkIn', errors: ["Check-in can't be in the past"] }])
 *
 * R.pipe({ checkIn: Date.UTC(2026, 6, 3), checkOut: Date.UTC(2026, 6, 3) }, validateBookingRange(rules))
 * // => Invalid([{ field: 'checkOut', errors: ['Stays are 2 to 14 nights'] }])
 * ```
 *
 * @tags booking, reservation, hotel, rental, stay, nights, check-in, checkout, dates, range
 * @see validateDateRange - any start and end, without nights or the past
 */
export function validateBookingRange(
  booking: ValidateBookingRangeInput,
  rules: ValidateBookingRangeRules,
): Validation<ValidateBookingRangeInput, FieldError<string>>
export function validateBookingRange(
  rules: ValidateBookingRangeRules,
): (booking: ValidateBookingRangeInput) => Validation<ValidateBookingRangeInput, FieldError<string>>
export function validateBookingRange(...args: unknown[]): unknown {
  return R.purry(validateBookingRangeImplementation, args)
}

const validateBookingRangeImplementation = (
  booking: ValidateBookingRangeInput,
  rules: ValidateBookingRangeRules,
): Validation<ValidateBookingRangeInput, FieldError<string>> => {
  const today = dayOf(rules.now)
  const checkIn = R.pipe(booking.checkIn, finite('Enter a check-in date'), flatMap(fromPredicate(by(dayOf, gte(today)), "Check-in can't be in the past")))
  const nights = (checkOut: number): number => dayOf(checkOut) - dayOf(booking.checkIn)
  // A broken check-in has its own message, so the nights aren't counted from it.
  const nightsAllowed = isValid(checkIn) ? by(nights, between(rules.minNights, rules.maxNights)) : always<number>()
  return schema<ValidateBookingRangeInput, string>(
    {
      checkIn: () => checkIn,
      checkOut: (checkOut) =>
        R.pipe(
          checkOut,
          finite('Enter a check-out date'),
          flatMap(fromPredicate(nightsAllowed, `Stays are ${rules.minNights} to ${rules.maxNights} nights`)),
        ),
    },
    booking,
  )
}
