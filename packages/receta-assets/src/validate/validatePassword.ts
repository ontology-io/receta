import * as R from 'remeda'
import { by, not, oneOf } from '@ontologyio/receta/predicate'
import {
  fromPredicate,
  matches,
  maxLength,
  minLength,
  validate,
  type Validation,
  type Validator,
} from '@ontologyio/receta/validation'

export type ValidatePasswordRules = {
  /** Fewest characters allowed. */
  readonly minLength: number
  /** Most characters allowed. Defaults to 128, so a huge paste can't slow the hash down. */
  readonly maxLength?: number
  /** Needs at least one uppercase letter. */
  readonly uppercase?: boolean
  /** Needs at least one lowercase letter. */
  readonly lowercase?: boolean
  /** Needs at least one digit. */
  readonly digit?: boolean
  /** Needs at least one character that is not a letter, digit or space. */
  readonly symbol?: boolean
  /** Passwords refused whatever their strength, compared without case: common ones, the user's email. */
  readonly forbidden?: readonly string[]
}

const DEFAULT_MAX_LENGTH = 128

const rulesFor = (rules: ValidatePasswordRules): readonly Validator<string, string, string>[] => {
  const longest = rules.maxLength ?? DEFAULT_MAX_LENGTH
  const forbidden = R.map(rules.forbidden ?? [], (word) => word.toLowerCase())
  return [
    minLength(rules.minLength, `Use at least ${rules.minLength} characters`),
    maxLength(longest, `Use at most ${longest} characters`),
    ...(rules.uppercase === true ? [matches(/\p{Lu}/u, 'Add an uppercase letter')] : []),
    ...(rules.lowercase === true ? [matches(/\p{Ll}/u, 'Add a lowercase letter')] : []),
    ...(rules.digit === true ? [matches(/\p{Nd}/u, 'Add a number')] : []),
    ...(rules.symbol === true ? [matches(/[^\p{L}\p{N}\s]/u, 'Add a symbol such as ! or #')] : []),
    fromPredicate(by((password: string) => password.toLowerCase(), not(oneOf(forbidden))), 'Choose a less common password'),
  ]
}

/**
 * Checks a new password against strength rules and lists every rule it breaks, in rule order.
 *
 * Use when: a sign-up or change-password form should show all the missing pieces at once,
 * such as "Add a number" and "Add a symbol", instead of one per submit. Only the rules you
 * turn on run, besides the length limits. Letters count in any script, so `É` is uppercase.
 * The password comes back unchanged: it is never trimmed.
 *
 * @example
 * ```ts
 * validatePassword('hunter2', { minLength: 12, uppercase: true, symbol: true })
 * // => Invalid(['Use at least 12 characters', 'Add an uppercase letter', 'Add a symbol such as ! or #'])
 *
 * validatePassword('Correct-horse-battery', { minLength: 12, uppercase: true, symbol: true })
 * // => Valid('Correct-horse-battery')
 *
 * R.pipe('Password123', validatePassword({ minLength: 8, forbidden: ['password123'] }))
 * // => Invalid(['Choose a less common password'])
 * ```
 *
 * @tags password, strength, signup, security, rules, complexity, form
 * @see validate - @ontologyio/receta/validation, runs every rule and keeps every message
 * @see validatePasswordConfirmation - the password and its repeat, as two form fields
 */
export function validatePassword(password: string, rules: ValidatePasswordRules): Validation<string, string>
export function validatePassword(rules: ValidatePasswordRules): (password: string) => Validation<string, string>
export function validatePassword(...args: unknown[]): unknown {
  return R.purry(validatePasswordImplementation, args)
}

const validatePasswordImplementation = (password: string, rules: ValidatePasswordRules): Validation<string, string> =>
  validate(password, rulesFor(rules))
