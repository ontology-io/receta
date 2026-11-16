import * as R from 'remeda'
import { always, and, by, includes, type Predicate } from '@ontologyio/receta/predicate'
import { normalizeWhitespace } from '@ontologyio/receta/string'

/** Lowercase, without accents, so `Zoë` and `zoe` meet. */
const fold = (text: string): string => text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

/** Text, numbers and lists of text are searchable; anything else counts as empty. */
const textOf = (value: unknown): string => {
  if (R.isString(value)) return value
  if (R.isNumber(value)) return String(value)
  return R.isArray(value) ? R.join(R.filter(value, R.isString), ' ') : ''
}

/**
 * Builds a search-box predicate: every word of the query must appear in at least one chosen field.
 *
 * Use when: a list, table or command menu has a search box, and typing `ada london` should
 * keep the people whose name or city holds both words. Matching ignores case and accents and
 * finds words inside longer ones, so `lon` finds `London`. Number fields and lists of strings,
 * such as tags, are searched too. A blank query keeps everything.
 *
 * @example
 * ```ts
 * const people = [
 *   { name: 'Ada Lovelace', city: 'London', tags: ['math'] },
 *   { name: 'Zoë Ng', city: 'Lyon', tags: ['design'] },
 *   { name: 'Alan Turing', city: 'Wilmslow', tags: ['math', 'crypto'] },
 * ]
 *
 * R.filter(people, matchesSearch('ada lon', ['name', 'city']))
 * // => [{ name: 'Ada Lovelace', city: 'London', tags: ['math'] }]
 *
 * R.map(R.filter(people, matchesSearch('ZOE', ['name'])), R.prop('city'))
 * // => ['Lyon']
 *
 * R.map(R.filter(people, matchesSearch('math', ['tags'])), R.prop('name'))
 * // => ['Ada Lovelace', 'Alan Turing']
 *
 * R.filter(people, matchesSearch('   ', ['name'])).length
 * // => 3
 * ```
 *
 * @tags search, query, find, text, filter, fuzzy, accent, case-insensitive, search box
 * @see matchesAnyTerm - keeps items that match any word, not all of them
 * @see matchesSubsequence - letters in order, for command palettes
 */
export function matchesSearch<T extends object>(query: string, keys: readonly (keyof T)[]): Predicate<T> {
  const terms = R.pipe(normalizeWhitespace(fold(query)), (folded) => (folded === '' ? [] : folded.split(' ')))
  if (R.isEmpty(terms)) return always<T>()
  // The fields are joined with spaces; a term has none, so it can't match across two fields.
  const searchable = (item: T): string => fold(R.join(R.map(keys, (key) => textOf(item[key])), ' '))
  return by(searchable, and(...R.map(terms, includes)))
}
