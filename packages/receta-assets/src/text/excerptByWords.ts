import * as R from 'remeda'
import { normalizeWhitespace, truncateWords } from '@ontologyio/receta/string'

/**
 * Shortens text to its first words as one line, ending in `…` when something was cut.
 *
 * Use when: a card, list row or notification previews the start of a post, comment or
 * message. Line breaks, tabs and runs of spaces collapse to single spaces first, so the
 * preview never wraps oddly. Text within the limit comes back whole, trimmed and without
 * `…`. For HTML, run it through `htmlToPlainText` first.
 *
 * @example
 * ```ts
 * excerptByWords('Ship the   release\nbefore Friday, then rest.', 4)
 * // => 'Ship the release before…'
 *
 * excerptByWords('  Short note  ', 4)
 * // => 'Short note'
 *
 * R.pipe('One two three four', excerptByWords(2))
 * // => 'One two…'
 * ```
 *
 * @tags excerpt, preview, summary, truncate, words, snippet, teaser
 * @see truncateWords - @ontologyio/receta/string, the cut by word count
 * @see normalizeWhitespace - @ontologyio/receta/string, the single-line cleanup
 * @see excerptByLength - the same preview limited by characters
 */
export function excerptByWords(text: string, maxWords: number): string
export function excerptByWords(maxWords: number): (text: string) => string
export function excerptByWords(...args: unknown[]): unknown {
  return R.purry(excerptByWordsImplementation, args)
}

const excerptByWordsImplementation = (text: string, maxWords: number): string =>
  truncateWords(normalizeWhitespace(text), maxWords, { suffix: '…' })
