import * as R from 'remeda'
import { match } from '@ontologyio/receta/option'
import { isEmail } from '@ontologyio/receta/string'

const MASK = '•••'

const maskAddress = (email: string): string =>
  `${email.slice(0, 1)}${MASK}${email.slice(email.lastIndexOf('@'))}`

/**
 * Hides an email address except its first letter and its domain: `j•••@example.com`.
 *
 * Use when: showing which address a code or reset link went to, in logs, support tools or
 * confirmation screens, without exposing the whole address. The mask has a fixed length,
 * so it doesn't reveal how long the name is. Anything that isn't an email comes back as
 * `•••`, so a mistyped phone number or token never leaks through.
 *
 * @example
 * ```ts
 * maskEmail('jane.doe@example.com')
 * // => 'j•••@example.com'
 *
 * maskEmail(' A@x.io ')
 * // => 'A•••@x.io'
 *
 * maskEmail('not an email')
 * // => '•••'
 * ```
 *
 * @tags mask, email, redact, privacy, pii, obfuscate, hide
 * @see isEmail - @ontologyio/receta/string, decides what counts as an email
 * @see maskPhone - the same idea for phone numbers
 */
export function maskEmail(email: string): string {
  return R.pipe(email.trim(), isEmail, match({ onSome: maskAddress, onNone: R.constant(MASK) }))
}
