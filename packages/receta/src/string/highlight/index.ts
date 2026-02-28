import * as R from 'remeda'
import { escapeRegex } from '../escapeRegex'
import { escapeHtml } from '../sanitize'

/**
 * Options for highlight function.
 */
export interface HighlightOptions {
  /**
   * HTML tag to wrap matched text.
   *
   * @default 'mark'
   */
  readonly tag?: string

  /**
   * CSS class name to add to the tag.
   *
   * @default undefined
   */
  readonly className?: string

  /**
   * If true, performs case-insensitive matching.
   *
   * @default true
   */
  readonly caseInsensitive?: boolean

  /**
   * If true, escapes HTML in the input text before highlighting.
   * This prevents XSS when highlighting user-generated content.
   *
   * @default true
   */
  readonly escapeHtml?: boolean
}

/**
 * Highlights matching substrings by wrapping them in HTML tags.
 *
 * Searches for the query string within the text and wraps all matches in HTML tags
 * (default: `<mark>`). Useful for search results, autocomplete, and text highlighting.
 *
 * By default, escapes HTML to prevent XSS attacks. Set `escapeHtml: false` if the
 * input is already trusted/sanitized.
 *
 * @param text - The text to search within
 * @param query - The substring to highlight
 * @param options - Highlighting options
 * @returns The text with matches wrapped in HTML tags
 *
 * @example
 * ```typescript
 * // Data-first
 * highlight('Hello world', 'world')
 * // => 'Hello <mark>world</mark>'
 *
 * highlight('JavaScript and TypeScript', 'script')
 * // => 'Java<mark>Script</mark> and Type<mark>Script</mark>'
 *
 * // Case-insensitive (default)
 * highlight('Hello WORLD', 'world')
 * // => 'Hello <mark>WORLD</mark>'
 *
 * // Custom tag and class
 * highlight('Search term here', 'term', {
 *   tag: 'span',
 *   className: 'highlight'
 * })
 * // => 'Search <span class="highlight">term</span> here'
 *
 * // Case-sensitive
 * highlight('Hello World', 'world', { caseInsensitive: false })
 * // => 'Hello World' (no match due to case)
 *
 * // Empty query returns original text
 * highlight('Hello world', '')
 * // => 'Hello world'
 *
 * // HTML escaping (default, prevents XSS)
 * highlight('<script>alert("xss")</script>', 'script')
 * // => '&lt;<mark>script</mark>&gt;alert(&quot;xss&quot;)&lt;/<mark>script</mark>&gt;'
 *
 * // Data-last (in pipe)
 * pipe(
 *   searchResults.map(r => r.title),
 *   R.map(highlight(searchQuery, { className: 'search-highlight' }))
 * )
 * ```
 *
 * @see escapeRegex - for escaping regex special characters
 * @see escapeHtml - for HTML escaping
 */
export function highlight(text: string, query: string, options?: HighlightOptions): string
export function highlight(
  query: string,
  options?: HighlightOptions
): (text: string) => string
export function highlight(...args: any[]): unknown {
  // Handle data-first: highlight(text, query, options?)
  if (args.length >= 2 && typeof args[0] === 'string' && typeof args[1] === 'string') {
    return highlightImplementation(args[0], args[1], args[2])
  }

  // Handle data-last: highlight(query, options?)(text)
  const query = args[0] as string
  const options = args[1] as HighlightOptions | undefined
  return (text: string) => highlightImplementation(text, query, options)
}

function highlightImplementation(
  text: string,
  query: string,
  options: HighlightOptions = {}
): string {
  const {
    tag = 'mark',
    className,
    caseInsensitive = true,
    escapeHtml: shouldEscape = true,
  } = options

  // Empty query returns original text
  if (query.trim().length === 0) {
    return shouldEscape ? escapeHtml(text) : text
  }

  // Escape HTML first if requested
  const processedText = shouldEscape ? escapeHtml(text) : text

  // Escape regex special characters in query
  const escapedQuery = escapeRegex(query)

  // Create regex with appropriate flags
  const flags = caseInsensitive ? 'gi' : 'g'
  const regex = new RegExp(escapedQuery, flags)

  // Build opening tag with optional class
  const openTag = className ? `<${tag} class="${className}">` : `<${tag}>`
  const closeTag = `</${tag}>`

  // Replace all matches with highlighted version
  return processedText.replace(regex, (match) => `${openTag}${match}${closeTag}`)
}
