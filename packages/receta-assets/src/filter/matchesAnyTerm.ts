import * as R from 'remeda'
import { always, by, includes, or, type Predicate } from '@ontologyio/receta/predicate'
import { normalizeWhitespace } from '@ontologyio/receta/string'

/** Lowercase, without accents, so `Café` and `cafe` meet. */
const fold = (text: string): string => text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

/** Text, numbers and lists of text are searchable; anything else counts as empty. */
const textOf = (value: unknown): string => {
  if (R.isString(value)) return value
  if (R.isNumber(value)) return String(value)
  return R.isArray(value) ? R.join(R.filter(value, R.isString), ' ') : ''
}

/**
 * Builds a predicate that keeps items where any word of the query appears in a chosen field.
 *
 * Use when: the query is a list of alternatives rather than a narrowing search, such as
 * `bug crash error` over ticket titles, or a pasted list of names or SKUs to pick out.
 * Matching ignores case and accents and finds words inside longer ones. Number fields and
 * lists of strings are searched too. A blank query keeps everything.
 *
 * @example
 * ```ts
 * const tickets = [
 *   { title: 'App crashes on launch' },
 *   { title: 'Add dark mode' },
 *   { title: 'Error when saving' },
 * ]
 *
 * R.filter(tickets, matchesAnyTerm('crash error', ['title']))
 * // => [{ title: 'App crashes on launch' }, { title: 'Error when saving' }]
 *
 * R.filter(tickets, matchesAnyTerm('', ['title'])).length
 * // => 3
 * ```
 *
 * @tags search, any, or, terms, keywords, query, filter, alternatives, find
 * @see matchesSearch - every word must match, the usual search box
 */
export function matchesAnyTerm<T extends object>(query: string, keys: readonly (keyof T)[]): Predicate<T> {
  const terms = R.pipe(normalizeWhitespace(fold(query)), (folded) => (folded === '' ? [] : folded.split(' ')))
  if (R.isEmpty(terms)) return always<T>()
  const searchable = (item: T): string => fold(R.join(R.map(keys, (key) => textOf(item[key])), ' '))
  return by(searchable, or(...R.map(terms, includes)))
}
