import * as R from 'remeda'
import { fromNullable, map, unwrapOr } from '@ontologyio/receta/option'
import { normalizeWhitespace, truncate } from '@ontologyio/receta/string'

// Up to the first . ! or ? that is followed by a capital, a digit, a quote or the end.
const SENTENCE = /^.+?[.!?](?=\s+[\p{Lu}\p{N}"'“‘(]|$)/u

/**
 * Takes the first sentence of a text as one line, cut at a word with `…` if it is too long.
 *
 * Use when: a commit body, a product description or an article lead has to become a
 * one-line summary, a tooltip or a meta description. A sentence ends at `.`, `!` or `?`
 * followed by a capital letter, a digit or the end, so `v2.0` and `e.g. this` don't end
 * it. A text without an ending is treated as one sentence. The `…` counts toward
 * `maxLength`.
 *
 * @example
 * ```ts
 * firstSentence('Version 2.0 is out! Get it from the store. More soon.', 80)
 * // => 'Version 2.0 is out!'
 *
 * firstSentence('Fast, e.g. under a second. Cheap too.', 80)
 * // => 'Fast, e.g. under a second.'
 *
 * R.pipe('A very long opening sentence without any end', firstSentence(22))
 * // => 'A very long opening…'
 * ```
 *
 * @tags sentence, summary, lead, first line, excerpt, description, tooltip
 * @see normalizeWhitespace - @ontologyio/receta/string, puts the text on one line
 * @see truncate - @ontologyio/receta/string, caps a long sentence at a word
 */
export function firstSentence(text: string, maxLength: number): string
export function firstSentence(maxLength: number): (text: string) => string
export function firstSentence(...args: unknown[]): unknown {
  return R.purry(firstSentenceImplementation, args)
}

const firstSentenceImplementation = (text: string, maxLength: number): string => {
  const flat = normalizeWhitespace(text)
  const sentence = R.pipe(fromNullable(SENTENCE.exec(flat)), map(([match]) => match), unwrapOr(flat))
  return truncate(sentence, { length: maxLength, words: true, ellipsis: '…' })
}
