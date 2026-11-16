import * as R from 'remeda'
import { email, flatMap, maxLength, required, validate, type Validation } from '@ontologyio/receta/validation'

/** RFC 5321 caps a forward path at 254 characters, so longer addresses can't receive mail. */
const MAX_EMAIL_LENGTH = 254

/**
 * Checks an email form field and returns the trimmed address, with every problem as a message.
 *
 * Use when: a sign-up, invite or contact form takes an email address and the field needs
 * messages a person can act on. A blank field reports only that it is required, not also that
 * its format is wrong. It doesn't lowercase the address, because the part before `@` can be
 * case-sensitive: lowercase it yourself before checking whether the address is taken.
 *
 * @example
 * ```ts
 * validateEmailField('  ada@example.com ')
 * // => Valid('ada@example.com')
 *
 * validateEmailField('   ')
 * // => Invalid(['Enter your email address'])
 *
 * validateEmailField('ada.example.com')
 * // => Invalid(['Enter an email address like name@example.com'])
 * ```
 *
 * @tags email, field, form, signup, contact, address, input
 * @see email - @ontologyio/receta/validation, the format check alone
 * @see required - @ontologyio/receta/validation, the blank check that gates the others
 */
export function validateEmailField(input: string): Validation<string, string> {
  return R.pipe(
    input.trim(),
    required('Enter your email address'),
    flatMap(
      validate([
        email('Enter an email address like name@example.com'),
        maxLength(MAX_EMAIL_LENGTH, `Email must be at most ${MAX_EMAIL_LENGTH} characters`),
      ]),
    ),
  )
}
