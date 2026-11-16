import * as R from 'remeda'
import { normalizeWhitespace, truncate } from '@ontologyio/receta/string'

/**
 * Shortens text to at most `maxLength` characters on one line, cut at a word and ending in `…`.
 *
 * Use when: a field has a hard character limit, such as a meta description, a push
 * notification or an SMS, and the text must not end mid-word. Whitespace collapses to
 * single spaces first. The `…` counts toward `maxLength`. A single word longer than the
 * limit is cut inside the word, since there is no space to cut at.
 *
 * @example
 * ```ts
 * excerptByLength('Fresh   bread\nevery morning at the corner bakery', 24)
 * // => 'Fresh bread every…'
 *
 * excerptByLength('Open daily', 24)
 * // => 'Open daily'
 *
 * R.pipe('Supercalifragilistic', excerptByLength(10))
 * // => 'Supercali…'
 * ```
 *
 * @tags excerpt, truncate, characters, meta description, preview, ellipsis, limit
 * @see truncate - @ontologyio/receta/string, the cut at a word boundary
 * @see excerptByWords - the same preview limited by word count
 */
export function excerptByLength(text: string, maxLength: number): string
export function excerptByLength(maxLength: number): (text: string) => string
export function excerptByLength(...args: unknown[]): unknown {
  return R.purry(excerptByLengthImplementation, args)
}

const excerptByLengthImplementation = (text: string, maxLength: number): string =>
  truncate(normalizeWhitespace(text), { length: maxLength, words: true, ellipsis: '…' })
