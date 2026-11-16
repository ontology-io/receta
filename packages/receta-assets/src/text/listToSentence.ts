import * as R from 'remeda'
import { isNotEmpty } from '@ontologyio/receta/predicate'
import { normalizeWhitespace } from '@ontologyio/receta/string'

/**
 * Joins items into an English phrase with commas and a final `and` or `or`: `a, b and c`.
 *
 * Use when: a message lists several things in prose, such as the fields that failed, the
 * people invited or the formats accepted. Items are trimmed and blank ones skipped. One
 * item comes back alone, two are joined by the word, and no items give `''`. There is no
 * comma before the final word.
 *
 * @example
 * ```ts
 * listToSentence(['email', 'password', 'name'], 'and')
 * // => 'email, password and name'
 *
 * listToSentence(['PNG', ' ', 'JPEG '], 'or')
 * // => 'PNG or JPEG'
 *
 * R.pipe(['Ana'], listToSentence('and'))
 * // => 'Ana'
 * ```
 *
 * @tags list, join, sentence, conjunction, and, or, comma, prose, enumerate
 * @see normalizeWhitespace - @ontologyio/receta/string, tidies each item
 * @see listWithOthers - names a few items and counts the rest
 */
export function listToSentence(items: readonly string[], conjunction: 'and' | 'or'): string
export function listToSentence(conjunction: 'and' | 'or'): (items: readonly string[]) => string
export function listToSentence(...args: unknown[]): unknown {
  return R.purry(listToSentenceImplementation, args)
}

const listToSentenceImplementation = (items: readonly string[], conjunction: 'and' | 'or'): string => {
  const kept = R.pipe(items, R.map(normalizeWhitespace), R.filter(isNotEmpty))
  const last = R.last(kept)
  if (kept.length < 2 || last === undefined) return last ?? ''
  return `${R.join(R.dropLast(kept, 1), ', ')} ${conjunction} ${last}`
}
