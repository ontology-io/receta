import * as R from 'remeda'
import { by, gte, lte } from '@ontologyio/receta/predicate'
import { finite, flatMap, fromPredicate, validate, type Validation } from '@ontologyio/receta/validation'

export type ValidateBirthDateRules = {
  /** The current time in milliseconds, passed in so the check stays pure. */
  readonly now: number
  /** Youngest age allowed, in whole years. */
  readonly minAge: number
  /** Oldest age believed before asking to check the year. Defaults to 120. */
  readonly maxAge?: number
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
 * Checks a date of birth against a minimum age, refusing future dates and unlikely old ones.
 *
 * Use when: sign-up, checkout or KYC must enforce an age limit such as 13, 18 or 21, and the
 * person should read why they can't continue. Ages are whole years in UTC, so a birthday counts
 * from the start of that day. A date that failed to parse arrives as `NaN` and is reported as
 * missing. Pass `now`, so tests and servers in other time zones agree. The date comes back
 * unchanged.
 *
 * @example
 * ```ts
 * const now = Date.UTC(2026, 5, 15)
 *
 * validateBirthDate(Date.UTC(2008, 5, 15), { now, minAge: 18 })
 * // => Valid(1213488000000)
 *
 * validateBirthDate(Date.UTC(2008, 5, 16), { now, minAge: 18 })
 * // => Invalid(['You must be at least 18 years old'])
 *
 * R.pipe(Date.UTC(2030, 0, 1), validateBirthDate({ now, minAge: 13 }))
 * // => Invalid(["Date of birth can't be in the future"])
 *
 * validateBirthDate(Date.UTC(1890, 0, 1), { now, minAge: 13 })
 * // => Invalid(['Check the year of birth'])
 * ```
 *
 * @tags birthday, birth, date, age, adult, minimum, kyc, coppa, signup, dob
 * @see isAdultAt - the same age rule as a predicate for filtering lists
 */
export function validateBirthDate(birthDate: number, rules: ValidateBirthDateRules): Validation<number, string>
export function validateBirthDate(rules: ValidateBirthDateRules): (birthDate: number) => Validation<number, string>
export function validateBirthDate(...args: unknown[]): unknown {
  return R.purry(validateBirthDateImplementation, args)
}

const validateBirthDateImplementation = (birthDate: number, rules: ValidateBirthDateRules): Validation<number, string> => {
  const age = ageAt(rules.now)
  return R.pipe(
    birthDate,
    finite('Enter a valid date of birth'),
    // A future date would also be "too young"; saying so would only add noise.
    flatMap(fromPredicate(lte(rules.now), "Date of birth can't be in the future")),
    flatMap(
      validate([
        fromPredicate(by(age, gte(rules.minAge)), `You must be at least ${rules.minAge} years old`),
        fromPredicate(by(age, lte(rules.maxAge ?? 120)), 'Check the year of birth'),
      ]),
    ),
  )
}
