import * as R from 'remeda'
import { filter, some, type Option } from '@ontologyio/receta/option'
import { isNotEmpty } from '@ontologyio/receta/predicate'
import { initials, normalizeWhitespace } from '@ontologyio/receta/string'

/** An email's local part, split at dots, dashes and underscores, stands in for a name. */
const nameOf = (nameOrEmail: string): string =>
  nameOrEmail.includes('@')
    ? nameOrEmail.slice(0, nameOrEmail.indexOf('@')).replace(/[._-]+/g, ' ')
    : nameOrEmail

const firstAndLast = (parts: readonly string[]): readonly string[] =>
  parts.length > 1 ? R.filter([R.first(parts), R.last(parts)], R.isDefined) : parts

/**
 * Gets the one or two letters for an avatar from a name or an email: first and last name.
 *
 * Use when: a user has no profile picture and the UI draws a circle with their initials.
 * Middle names are skipped, so `Mary Jane Watson` gives `MW`, not `MJ`. An email such as
 * `jane.doe@example.com` gives `JD`. Returns `None` when there is nothing to take letters
 * from, so the caller can fall back to an icon.
 *
 * @example
 * ```ts
 * avatarInitials('Mary Jane Watson')
 * // => Some('MW')
 *
 * avatarInitials('jane.doe@example.com')
 * // => Some('JD')
 *
 * avatarInitials('  cher ')
 * // => Some('C')
 *
 * avatarInitials('   ')
 * // => None
 * ```
 *
 * @tags initials, avatar, monogram, profile, name, placeholder, user
 * @see initials - @ontologyio/receta/string, the letters of every word
 */
export function avatarInitials(nameOrEmail: string): Option<string> {
  return R.pipe(
    normalizeWhitespace(nameOf(nameOrEmail)),
    R.split(' '),
    R.filter(isNotEmpty),
    firstAndLast,
    R.join(' '),
    (letters) => initials(letters),
    some,
    filter<string>(isNotEmpty),
  )
}
