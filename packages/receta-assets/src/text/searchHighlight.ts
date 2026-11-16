import * as R from 'remeda'
import { isNotEmpty } from '@ontologyio/receta/predicate'
import { escapeHtml, escapeRegex, normalizeWhitespace } from '@ontologyio/receta/string'

const isMatch = (index: number): boolean => index % 2 === 1

/**
 * Wraps every word of a search query found in a text in `<mark>`, returning safe HTML.
 *
 * Use when: showing search results with the matched words highlighted, where both the
 * text and the query come from users. Each query word is matched on its own, in any case
 * and order, longest first, so `java script` marks both words and `javascript` isn't cut
 * short by `java`. The text is HTML-escaped piece by piece, so a query such as `amp` can't
 * land inside `&amp;` and a `<script>` in the text stays inert.
 *
 * @example
 * ```ts
 * searchHighlight('Fish & Chips <today>', 'chips FISH')
 * // => '<mark>Fish</mark> &amp; <mark>Chips</mark> &lt;today&gt;'
 *
 * searchHighlight('a & b', 'amp')
 * // => 'a &amp; b'
 *
 * R.pipe('Learn JavaScript', searchHighlight('java javascript'))
 * // => 'Learn <mark>JavaScript</mark>'
 *
 * searchHighlight('Price (USD)', '   ')
 * // => 'Price (USD)'
 * ```
 *
 * @tags highlight, search, mark, query, results, html, escape, xss
 * @see highlight - @ontologyio/receta/string, highlights the query as one phrase
 * @see escapeRegex - @ontologyio/receta/string, makes each word safe in a pattern
 * @see escapeHtml - @ontologyio/receta/string, makes the text safe as HTML
 */
export function searchHighlight(text: string, query: string): string
export function searchHighlight(query: string): (text: string) => string
export function searchHighlight(...args: unknown[]): unknown {
  return R.purry(searchHighlightImplementation, args)
}

const searchHighlightImplementation = (text: string, query: string): string => {
  const terms = R.pipe(
    normalizeWhitespace(query),
    R.split(' '),
    R.filter(isNotEmpty),
    R.uniqueBy((term) => term.toLowerCase()),
    R.sortBy([(term) => term.length, 'desc']),
    R.map(escapeRegex),
  )
  if (terms.length === 0) return escapeHtml(text)
  // One capturing group, so split puts every match at an odd index.
  const pattern = new RegExp(`(${R.join(terms, '|')})`, 'gi')
  return R.pipe(
    text.split(pattern),
    R.map((piece, index) => (isMatch(index) ? `<mark>${escapeHtml(piece)}</mark>` : escapeHtml(piece))),
    R.join(''),
  )
}
