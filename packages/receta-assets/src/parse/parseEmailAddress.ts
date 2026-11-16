import * as R from 'remeda'
import { filter, fromNullable, map as mapOption, toResult, type Option } from '@ontologyio/receta/option'
import { not } from '@ontologyio/receta/predicate'
import { map, type Result } from '@ontologyio/receta/result'
import { isBlank, isEmail, normalizeWhitespace } from '@ontologyio/receta/string'

export type ParseEmailAddressError = {
  readonly code: 'INVALID_EMAIL'
  readonly input: string
  readonly message: string
}

export type ParseEmailAddressMailbox = {
  /** The display name, such as `Ada Lovelace`, when one was given. */
  readonly name: Option<string>
  readonly email: string
}

/** `Name <address>` or `"Last, First" <address>`. */
const NAMED = /^\s*(?:"((?:[^"\\]|\\.)*)"|([^<"]*?))\s*<([^<>]*)>\s*$/

/**
 * Splits an address such as `Ada Lovelace <ada@example.com>` into an optional display name and a checked email.
 *
 * Use when: reading `From`, `To` or `Reply-To` style values, a contact pasted from a mail
 * client, or an invite field where people paste whole addresses. Plain `ada@example.com`,
 * `<ada@example.com>`, `Ada <ada@example.com>` and `"Lovelace, Ada" <ada@example.com>` are
 * understood. The email is checked with Receta's practical `isEmail` rule; the name has its
 * spaces tidied and is None when absent or blank.
 *
 * @example
 * ```ts
 * parseEmailAddress('Ada Lovelace <ada@example.com>')
 * // => Ok({ name: Some('Ada Lovelace'), email: 'ada@example.com' })
 *
 * parseEmailAddress('"Lovelace, Ada" <ada@example.com>')
 * // => Ok({ name: Some('Lovelace, Ada'), email: 'ada@example.com' })
 *
 * parseEmailAddress(' grace@example.org ')
 * // => Ok({ name: None, email: 'grace@example.org' })
 *
 * parseEmailAddress('Ada <ada at example dot com>')
 * // => Err({ code: 'INVALID_EMAIL', input: 'Ada <ada at example dot com>', message: 'Expected an email such as ada@example.com or Ada <ada@example.com>, got "Ada <ada at example dot com>"' })
 * ```
 *
 * @tags email, address, mailbox, display name, contact, from, recipient, invite
 * @see isEmail - @ontologyio/receta/string, the address check
 * @see parseCommaList - split several pasted addresses first
 */
export function parseEmailAddress(
  input: string,
): Result<ParseEmailAddressMailbox, ParseEmailAddressError> {
  const named = NAMED.exec(input)
  const [, quoted, plain, address = input] = named ?? []
  const name = R.pipe(
    fromNullable(quoted ?? plain),
    mapOption((text) => normalizeWhitespace(text.replace(/\\(.)/g, '$1'))),
    filter(not(isBlank)),
  )
  return R.pipe(
    isEmail(address.trim()),
    toResult<ParseEmailAddressError>({
      code: 'INVALID_EMAIL',
      input,
      message: `Expected an email such as ada@example.com or Ada <ada@example.com>, got "${input}"`,
    }),
    map((email) => ({ name, email })),
  )
}
