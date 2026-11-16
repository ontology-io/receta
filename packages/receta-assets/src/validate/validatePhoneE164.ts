import * as R from 'remeda'
import { between, by, not, startsWith } from '@ontologyio/receta/predicate'
import { flatMap, fromPredicate, matches, required, validate, type Validation } from '@ontologyio/receta/validation'

/** Spaces, dots, dashes and brackets people type between digit groups. */
const SEPARATORS = /[\s.\-()]/g

const digitCount = (phone: string): number => phone.replace(/\D/g, '').length

/**
 * Checks an international phone number and returns it in E.164 form, like `+14155550123`.
 *
 * Use when: storing a phone number for SMS, calls or two-factor codes, where providers such
 * as Twilio want E.164. Spaces, dots, dashes and brackets are dropped first, so
 * `+1 (415) 555-0123` is fine. It checks the shape only, 7 to 15 digits after a `+` with a
 * country code that doesn't start with 0; it doesn't know each country's numbering plan.
 *
 * @example
 * ```ts
 * validatePhoneE164('+1 (415) 555-0123')
 * // => Valid('+14155550123')
 *
 * validatePhoneE164('415-555-0123')
 * // => Invalid(['Start with + and the country code, like +14155550123'])
 *
 * validatePhoneE164('+0 12')
 * // => Invalid(["Country codes don't start with 0", 'Use 7 to 15 digits'])
 *
 * validatePhoneE164('  ')
 * // => Invalid(['Enter a phone number'])
 * ```
 *
 * @tags phone, e164, sms, mobile, telephone, twilio, 2fa, normalize
 * @see validate - @ontologyio/receta/validation, runs every rule and keeps every message
 */
export function validatePhoneE164(input: string): Validation<string, string> {
  return R.pipe(
    input.replace(SEPARATORS, ''),
    required('Enter a phone number'),
    flatMap(
      validate([
        fromPredicate(startsWith('+'), 'Start with + and the country code, like +14155550123'),
        matches(/^\+?\d*$/, 'Use only digits after the +'),
        fromPredicate(not(startsWith('+0')), "Country codes don't start with 0"),
        fromPredicate(by(digitCount, between(7, 15)), 'Use 7 to 15 digits'),
      ]),
    ),
  )
}
