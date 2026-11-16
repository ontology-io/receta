import * as R from 'remeda'
import { normalizeWhitespace, stripHtml, unescapeHtml } from '@ontologyio/receta/string'

// Block elements and line breaks separate words, so they turn into spaces before tags go.
const BLOCK_BOUNDARY =
  /<\/?(?:address|article|aside|blockquote|br|dd|div|dl|dt|figcaption|figure|footer|h[1-6]|header|hr|li|main|nav|ol|p|pre|section|table|td|th|tr|ul)\b[^>]*>/gi

/**
 * Turns an HTML fragment into one line of readable text: tags dropped, entities decoded.
 *
 * Use when: rich text from a CMS, an editor or an email has to become a preview, a search
 * index entry or a notification. Paragraphs, list items and `<br>` become spaces, so
 * `<p>a</p><p>b</p>` reads `a b`, not `ab`. Scripts and styles go with their contents.
 * Only `&amp;`, `&lt;`, `&gt;`, `&quot;` and `&#39;` are decoded; others such as `&nbsp;`
 * stay as written. The result is text, not HTML: escape it again before putting it back
 * into markup.
 *
 * @example
 * ```ts
 * htmlToPlainText('<h2>Menu</h2><p>Fish &amp; chips<br>every <b>Friday</b></p>')
 * // => 'Menu Fish & chips every Friday'
 *
 * htmlToPlainText('<script>track()</script><ul><li>One</li><li>Two</li></ul>')
 * // => 'One Two'
 *
 * htmlToPlainText('')
 * // => ''
 * ```
 *
 * @tags html, plain text, strip tags, sanitize, preview, rich text, search index
 * @see stripHtml - @ontologyio/receta/string, removes tags but joins adjacent blocks
 * @see unescapeHtml - @ontologyio/receta/string, decodes the entities
 */
export function htmlToPlainText(html: string): string {
  return R.pipe(html.replace(BLOCK_BOUNDARY, ' '), stripHtml, unescapeHtml, normalizeWhitespace)
}
