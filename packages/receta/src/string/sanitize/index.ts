import * as R from 'remeda'
import type { EscapeHtmlOptions } from '../types'

/**
 * Removes all HTML tags from a string.
 *
 * Strips all HTML tags, leaving only the text content. Does not decode
 * HTML entities - use unescapeHtml for that.
 *
 * A block-level tag (`<p>`, `<div>`, `<li>`, `<br>`, a heading, a table cell…) separates
 * words, so the text on either side stays apart by one space. Inline tags such as
 * `<strong>` leave no space behind.
 *
 * @param str - The string containing HTML
 * @returns The string with all HTML tags removed
 *
 * @example
 * ```typescript
 * stripHtml('<p>Hello <strong>world</strong>!</p>')
 * // => 'Hello world!'
 *
 * stripHtml('<p>First paragraph</p><p>Second paragraph</p>')
 * // => 'First paragraph Second paragraph'
 *
 * stripHtml('un<em>believ</em>able')
 * // => 'unbelievable'
 *
 * stripHtml('<script>alert("xss")</script>Safe text')
 * // => 'Safe text'
 *
 * stripHtml('No tags here')
 * // => 'No tags here'
 *
 * // Use for user-generated content
 * pipe(
 *   userComment,
 *   stripHtml,
 *   truncate({ length: 100 })
 * )
 * ```
 *
 * @see escapeHtml - to escape HTML special characters
 */
export function stripHtml(str: string): string {
  // Remove script and style tags with content
  const withoutCode = str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')

  // The capture group makes split return the tags too, at the odd positions
  const pieces = withoutCode.split(/(<[^>]*>)/)

  return R.reduce(
    pieces,
    (state: StrippedText, piece, index) => {
      if (index % 2 === 1) {
        return BLOCK_TAG.test(piece) ? { ...state, afterBlock: true } : state
      }
      if (piece === '') {
        return state
      }

      // A block tag was removed between two words: keep them apart
      const needsSpace = state.afterBlock && /\S$/.test(state.text) && /^\S/.test(piece)

      return { text: state.text + (needsSpace ? ' ' : '') + piece, afterBlock: false }
    },
    { text: '', afterBlock: false }
  ).text
}

interface StrippedText {
  readonly text: string
  readonly afterBlock: boolean
}

// Tags a browser starts a new line for. Text on either side of one is not the same word.
const BLOCK_TAG =
  /^<\/?(?:address|article|aside|blockquote|br|dd|div|dl|dt|fieldset|figcaption|figure|footer|form|h[1-6]|header|hr|li|main|nav|ol|p|pre|section|table|tbody|td|tfoot|th|thead|tr|ul)\b/i

/**
 * Escapes HTML special characters.
 *
 * Converts characters that have special meaning in HTML to their entity equivalents:
 * - & → &amp;
 * - < → &lt;
 * - > → &gt;
 * - " → &quot;
 * - ' → &#x27; (if escapeSingleQuote is true)
 *
 * @param str - The string to escape
 * @param options - Escape options
 * @returns The escaped string safe for HTML
 *
 * @example
 * ```typescript
 * // Data-first
 * escapeHtml('<script>alert("XSS")</script>')
 * // => '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;'
 *
 * escapeHtml("It's a test", { escapeSingleQuote: true })
 * // => 'It&#x27;s a test'
 *
 * // Data-last (in pipe)
 * pipe(
 *   userInput,
 *   escapeHtml({ escapeSingleQuote: true })
 * )
 *
 * // Use in user-generated content
 * const safeComment = escapeHtml(userComment)
 * ```
 *
 * @see stripHtml - to remove HTML tags entirely
 * @see unescapeHtml - to decode HTML entities
 */
export function escapeHtml(str: string, options?: EscapeHtmlOptions): string
export function escapeHtml(options: EscapeHtmlOptions): (str: string) => string
export function escapeHtml(...args: any[]): any {
  // Manual data-first/data-last detection since options is optional
  if (args.length === 1 && typeof args[0] === 'object' && args[0] !== null) {
    // Data-last: escapeHtml({options})
    const options = args[0] as EscapeHtmlOptions
    return (str: string) => escapeHtmlImplementation(str, options)
  }
  // Data-first: escapeHtml(str, options?)
  return escapeHtmlImplementation(args[0] as string, args[1] as EscapeHtmlOptions | undefined)
}

function escapeHtmlImplementation(str: string, options?: EscapeHtmlOptions): string {
  const { escapeSingleQuote = false } = options ?? {}

  const entityMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
  }

  if (escapeSingleQuote) {
    entityMap["'"] = '&#x27;'
  }

  return str.replace(/[&<>"']/g, (char) => entityMap[char] || char)
}

/**
 * Decodes HTML entities to their character equivalents.
 *
 * Decodes every numeric character reference (`&#169;`, `&#xA9;`) and the common named
 * entities: `amp`, `lt`, `gt`, `quot`, `apos`, `nbsp`, `copy`, `reg`, `trade`, `hellip`,
 * `mdash`, `ndash`, the curly quotes (`lsquo`, `rsquo`, `ldquo`, `rdquo`), `laquo`,
 * `raquo`, `bull`, `middot`, `euro`, `pound`, `yen`, `cent`, `deg`, `plusmn`, `times`,
 * `divide`, `sect` and `para`. Any other named entity is left as it is.
 *
 * The string is decoded once: `&amp;lt;` becomes `&lt;`, not `<`.
 *
 * @param str - The string containing HTML entities
 * @returns The decoded string
 *
 * @example
 * ```typescript
 * unescapeHtml('&lt;script&gt;')
 * // => '<script>'
 *
 * unescapeHtml('&quot;Hello&quot;')
 * // => '"Hello"'
 *
 * unescapeHtml('&amp; &lt; &gt;')
 * // => '& < >'
 *
 * unescapeHtml('&copy; 2026 Tom&apos;s &#8212; &#x1F600;')
 * // => "© 2026 Tom's — 😀"
 * ```
 *
 * @see escapeHtml - to encode special characters
 */
export function unescapeHtml(str: string): string {
  return str.replace(
    /&(?:#(\d+)|#x([0-9a-f]+)|([a-z][a-z0-9]*));/gi,
    (entity: string, decimal?: string, hex?: string, name?: string) => {
      if (name !== undefined) {
        return Object.hasOwn(NAMED_ENTITIES, name) ? NAMED_ENTITIES[name]! : entity
      }

      const codePoint = decimal !== undefined ? Number(decimal) : Number.parseInt(hex ?? '', 16)

      return isCharacter(codePoint) ? String.fromCodePoint(codePoint) : entity
    }
  )
}

const NAMED_ENTITIES: Readonly<Record<string, string>> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: '\u00A0',
  copy: '©',
  reg: '®',
  trade: '™',
  hellip: '…',
  mdash: '—',
  ndash: '–',
  lsquo: '‘',
  rsquo: '’',
  ldquo: '“',
  rdquo: '”',
  laquo: '«',
  raquo: '»',
  bull: '•',
  middot: '·',
  euro: '€',
  pound: '£',
  yen: '¥',
  cent: '¢',
  deg: '°',
  plusmn: '±',
  times: '×',
  divide: '÷',
  sect: '§',
  para: '¶',
}

// A code point a character reference may name: not NUL, not a surrogate, inside Unicode
function isCharacter(codePoint: number): boolean {
  const isSurrogate = codePoint >= 0xd800 && codePoint <= 0xdfff

  return codePoint > 0 && codePoint <= 0x10ffff && !isSurrogate
}

/**
 * Trims whitespace from both ends of a string.
 *
 * Enhanced version of String.prototype.trim that's pipe-friendly.
 *
 * @param str - The string to trim
 * @returns The trimmed string
 *
 * @example
 * ```typescript
 * trim('  hello  ')
 * // => 'hello'
 *
 * trim('\n\t  test  \n')
 * // => 'test'
 *
 * // Use in pipes
 * pipe(
 *   userInput,
 *   trim,
 *   truncate({ length: 50 })
 * )
 * ```
 *
 * @see trimStart - trim only leading whitespace
 * @see trimEnd - trim only trailing whitespace
 */
export function trim(str: string): string {
  return str.trim()
}

/**
 * Trims whitespace from the start of a string.
 *
 * @param str - The string to trim
 * @returns The string with leading whitespace removed
 *
 * @example
 * ```typescript
 * trimStart('  hello  ')
 * // => 'hello  '
 *
 * trimStart('\n\t  test')
 * // => 'test'
 * ```
 *
 * @see trim - trim both ends
 * @see trimEnd - trim trailing whitespace
 */
export function trimStart(str: string): string {
  return str.trimStart()
}

/**
 * Trims whitespace from the end of a string.
 *
 * @param str - The string to trim
 * @returns The string with trailing whitespace removed
 *
 * @example
 * ```typescript
 * trimEnd('  hello  ')
 * // => '  hello'
 *
 * trimEnd('test\n\t  ')
 * // => 'test'
 * ```
 *
 * @see trim - trim both ends
 * @see trimStart - trim leading whitespace
 */
export function trimEnd(str: string): string {
  return str.trimEnd()
}
