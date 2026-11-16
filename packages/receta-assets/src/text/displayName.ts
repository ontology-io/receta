import * as R from 'remeda'
import { filter, some, type Option } from '@ontologyio/receta/option'
import { isNotEmpty } from '@ontologyio/receta/predicate'
import { capitalize, normalizeWhitespace } from '@ontologyio/receta/string'

export type DisplayNameParts = {
  readonly first?: string | null | undefined
  readonly middle?: string | null | undefined
  readonly last?: string | null | undefined
}

// The first letter of the part and of every word, hyphen or apostrophe piece within it.
const WORD_START = /(^|[\s'’-])(\p{L})/gu

const capitalizeWords = (part: string): string =>
  part.toLowerCase().replace(WORD_START, (_, before: string, letter: string) => `${before}${capitalize(letter)}`)

/** A part typed all in one case gets fixed; mixed case such as `McDonald` was meant. */
const fixCase = (part: string): string =>
  part === part.toLowerCase() || part === part.toUpperCase() ? capitalizeWords(part) : part

/**
 * Builds a person's full name from its parts, fixing parts typed all lower or upper case.
 *
 * Use when: showing a name from a form, a CRM or an import where parts may be missing,
 * padded with spaces, or typed as `ada` or `LOVELACE`. A part in mixed case such as
 * `McDonald` or `van der Berg` is kept as typed. Hyphenated and apostrophe names work:
 * `jean-luc` gives `Jean-Luc`, `o'brien` gives `O'Brien`. Returns `None` when every part is
 * blank, so the caller can fall back to an email or `Anonymous`.
 *
 * @example
 * ```ts
 * displayName({ first: 'ada', last: 'LOVELACE' })
 * // => Some('Ada Lovelace')
 *
 * displayName({ first: ' jean-luc ', middle: null, last: "o'brien" })
 * // => Some("Jean-Luc O'Brien")
 *
 * displayName({ first: 'maría josé', last: 'van der Berg' })
 * // => Some('María José van der Berg')
 *
 * displayName({ first: '  ', last: undefined })
 * // => None
 * ```
 *
 * @tags name, full name, display name, person, capitalize, title case, user
 * @see capitalize - @ontologyio/receta/string, uppercases each word's first letter
 * @see normalizeWhitespace - @ontologyio/receta/string, trims and collapses each part
 */
export function displayName(parts: DisplayNameParts): Option<string> {
  return R.pipe(
    [parts.first, parts.middle, parts.last],
    R.filter(R.isNonNullish),
    R.map(normalizeWhitespace),
    R.filter(isNotEmpty),
    R.map(fixCase),
    R.join(' '),
    some,
    filter<string>(isNotEmpty),
  )
}
