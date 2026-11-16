import * as R from 'remeda'
import { normalizeWhitespace } from '@ontologyio/receta/string'

/**
 * Reduces a search query to lowercase words without accents or punctuation: `cafe creme`.
 *
 * Use when: comparing what someone typed with stored text, as a cache key for search
 * results, or before logging queries, so `Café  CRÈME!` and `cafe creme` count as the same
 * search. Run the stored text through it too. Apostrophes are dropped inside words
 * (`don't` → `dont`) and other symbols become spaces, so `c++` and `c#` both become `c`:
 * keep the raw query when symbols matter.
 *
 * @example
 * ```ts
 * normalizeSearchQuery('  Café   CRÈME brûlée! ')
 * // => 'cafe creme brulee'
 *
 * normalizeSearchQuery("Don't-stop  (live)")
 * // => 'dont stop live'
 *
 * normalizeSearchQuery('?!')
 * // => ''
 * ```
 *
 * @tags search, query, normalize, accents, diacritics, case insensitive, fold, key
 * @see normalizeWhitespace - @ontologyio/receta/string, collapses the spaces
 */
export function normalizeSearchQuery(query: string): string {
  return R.pipe(
    query.normalize('NFKD').replace(/\p{M}/gu, ''),
    R.toLowerCase(),
    (text) => text.replace(/['’]/g, '').replace(/[^\p{L}\p{N}]+/gu, ' '),
    normalizeWhitespace,
  )
}
