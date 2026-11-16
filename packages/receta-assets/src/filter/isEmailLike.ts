import { isSome } from '@ontologyio/receta/option'
import { isString } from '@ontologyio/receta/predicate'
import { isEmail } from '@ontologyio/receta/string'

/**
 * Keeps values that are strings shaped like an email address, and types them as strings.
 *
 * Use when: picking addresses out of untyped data, such as a pasted list, an imported column
 * or a JSON field, before sending invites or deduplicating contacts. The shape is
 * `something@domain.tld` with no spaces anywhere, so an address with stray spaces is
 * dropped: trim first if you want those kept. It doesn't check that the mailbox exists.
 *
 * @example
 * ```ts
 * const pasted: unknown[] = ['ada@example.com', 'not an email', 42, ' grace@example.org', 'alan@example.co.uk']
 *
 * R.filter(pasted, isEmailLike)
 * // => ['ada@example.com', 'alan@example.co.uk']
 *
 * isEmailLike('ada@localhost')
 * // => false
 * ```
 *
 * @tags email, guard, filter, contacts, import, clean, unknown, address
 * @see isEmail - @ontologyio/receta/string, the same shape check as an Option
 * @see validateEmailField - a form field, with messages
 */
export function isEmailLike(value: unknown): value is string {
  return isString(value) && isSome(isEmail(value))
}
