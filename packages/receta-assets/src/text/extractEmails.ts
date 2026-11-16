import * as R from 'remeda'
import { isSome } from '@ontologyio/receta/option'
import { extract, isEmail } from '@ontologyio/receta/string'

// Anything around an @ up to whitespace or characters that can't be in an unquoted address.
const CANDIDATE = /[^\s<>()[\]{}",;:]+@[^\s<>()[\]{}",;:]+/g
const EDGE_PUNCTUATION = /^['`.]+|['`.!?]+$/g

/**
 * Finds the email addresses in free text, lowercased, each once, in order of appearance.
 *
 * Use when: pulling contacts out of a pasted list, a support ticket, a signature or an
 * import where addresses sit among names, brackets and punctuation. `Ana <ana@x.io>`,
 * `mailto:ana@x.io` and an address ending a sentence all work. Addresses compare without
 * case. Candidates that don't pass `isEmail` are dropped.
 *
 * @example
 * ```ts
 * extractEmails('Ana <Ana@Example.com>, bob@x.io; write to ana@example.com.')
 * // => ['ana@example.com', 'bob@x.io']
 *
 * extractEmails('mailto:team@acme.dev or @handle or a@b')
 * // => ['team@acme.dev']
 *
 * extractEmails('')
 * // => []
 * ```
 *
 * @tags email, extract, contacts, parse, import, find, addresses
 * @see extract - @ontologyio/receta/string, finds the candidates
 * @see isEmail - @ontologyio/receta/string, keeps only real-looking addresses
 */
export function extractEmails(text: string): readonly string[] {
  return R.pipe(
    extract(text, CANDIDATE),
    R.map((candidate) => candidate.replace(EDGE_PUNCTUATION, '').toLowerCase()),
    R.filter((candidate) => isSome(isEmail(candidate))),
    R.unique(),
  )
}
