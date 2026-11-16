import * as R from 'remeda'
import { between, by, endsWith, not, or, startsWith } from '@ontologyio/receta/predicate'
import { flatMap, fromPredicate, matches, required, validate, type Validation } from '@ontologyio/receta/validation'

/**
 * Tidies a promo, gift or invite code a person typed and checks its shape before it is looked up.
 *
 * Use when: a checkout or sign-up form has a coupon, voucher, referral or invite code box, and
 * `summer 25 ` should match the stored `SUMMER25`. Spaces are dropped and letters uppercased,
 * and that tidied code is what comes back. A code is 4 to 20 letters, digits or dashes, not
 * starting or ending with a dash. It checks the shape only; look the code up afterwards.
 *
 * @example
 * ```ts
 * validateCouponCode(' summer 25 ')
 * // => Valid('SUMMER25')
 *
 * validateCouponCode('10%off!')
 * // => Invalid(['Codes use only letters, numbers and dashes'])
 *
 * validateCouponCode('-AB')
 * // => Invalid(['Codes are 4 to 20 characters long', "Codes don't start or end with a dash"])
 * ```
 *
 * @tags coupon, promo, voucher, discount, code, gift, referral, invite, checkout
 * @see validate - @ontologyio/receta/validation, runs every rule and keeps every message
 */
export function validateCouponCode(input: string): Validation<string, string> {
  return R.pipe(
    input.replace(/\s+/g, '').toUpperCase(),
    required('Enter a code'),
    flatMap(
      validate([
        matches(/^[A-Z0-9-]*$/, 'Codes use only letters, numbers and dashes'),
        fromPredicate(by((code: string) => code.length, between(4, 20)), 'Codes are 4 to 20 characters long'),
        fromPredicate(not(or(startsWith('-'), endsWith('-'))), "Codes don't start or end with a dash"),
      ]),
    ),
  )
}
