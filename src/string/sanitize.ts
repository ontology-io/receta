import * as R from 'remeda'
import type { EscapeHtmlOptions } from './types'

/**
 * Removes all HTML tags from a string.
 *
 * Strips all HTML tags, leaving only the text content. Does not decode
 * HTML entities - use unescapeHtml for that.
 *
 * @param str - The string containing HTML
 * @returns The string with all HTML tags removed
 *
 * @example
 * ```typescript
 * stripHtml('<p>Hello <strong>world</strong>!</p>')
 * // => 'Hello world!'
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
  let result = str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  result = result.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
  // Remove remaining HTML tags
  return result.replace(/<[^>]*>/g, '')
}

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
 * ```
 *
 * @see escapeHtml - to encode special characters
 */
export function unescapeHtml(str: string): string {
  const entityMap: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#x27;': "'",
    '&#39;': "'",
  }

  return str.replace(/&(?:amp|lt|gt|quot|#x27|#39);/g, (entity) => entityMap[entity] || entity)
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
