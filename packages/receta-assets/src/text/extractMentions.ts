import * as R from 'remeda'
import { extract } from '@ontologyio/receta/string'

// An @ not glued to a word, a dot or another @, so the middle of an email doesn't match.
const MENTION = /(?<![\w.@])@[A-Za-z0-9_](?:[A-Za-z0-9_-]*[A-Za-z0-9_])?/g

/**
 * Finds the `@username` mentions in a message, lowercased, without `@`, each once.
 *
 * Use when: notifying the people mentioned in a comment, chat message or pull request
 * review. Email addresses aren't mentions, so `ana@example.com` is skipped. Usernames are
 * letters, digits, underscores and inner hyphens, as on GitHub and most chat apps, and
 * trailing punctuation such as `@bob.` or `@cy,` is left out. Names compare without case.
 *
 * @example
 * ```ts
 * extractMentions('Thanks @Ana and @bob-smith! cc @ana, mail ana@example.com')
 * // => ['ana', 'bob-smith']
 *
 * extractMentions('(@cy_99) see @dee.')
 * // => ['cy_99', 'dee']
 *
 * extractMentions('nobody here')
 * // => []
 * ```
 *
 * @tags mention, username, at, notify, extract, chat, comment, social
 * @see extract - @ontologyio/receta/string, finds every match of a pattern
 * @see extractHashtags - the same for `#topic`
 */
export function extractMentions(text: string): readonly string[] {
  return R.pipe(
    extract(text, MENTION),
    R.map((mention) => mention.slice(1).toLowerCase()),
    R.unique(),
  )
}
