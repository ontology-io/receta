/**
 * Normalizes whitespace in a string by replacing multiple consecutive whitespace
 * characters with a single space and trimming leading/trailing whitespace.
 *
 * This includes:
 * - Multiple spaces → single space
 * - Tabs → single space
 * - Newlines → single space
 * - Mixed whitespace → single space
 * - Leading/trailing whitespace → removed
 *
 * Useful for cleaning up user input, normalizing text for search/comparison,
 * and formatting data from external sources.
 *
 * @param str - The string to normalize
 * @returns The normalized string with single spaces between words
 *
 * @example
 * ```typescript
 * normalizeWhitespace('Hello    world')
 * // => 'Hello world'
 *
 * normalizeWhitespace('  foo\t\tbar  ')
 * // => 'foo bar'
 *
 * normalizeWhitespace('line1\n\nline2\n\n\nline3')
 * // => 'line1 line2 line3'
 *
 * normalizeWhitespace('mixed   \t\n  whitespace')
 * // => 'mixed whitespace'
 *
 * normalizeWhitespace('')
 * // => ''
 *
 * // Useful for search normalization
 * const searchQuery = normalizeWhitespace(userInput)
 *
 * // Or data cleanup
 * const cleanedData = pipe(
 *   rawText,
 *   normalizeWhitespace,
 *   trim
 * )
 * ```
 *
 * @see trim - for removing leading/trailing whitespace only
 * @see stripHtml - for removing HTML tags and normalizing text
 */
export function normalizeWhitespace(str: string): string {
  // Replace all whitespace sequences (spaces, tabs, newlines, etc.) with single space
  // Then trim leading/trailing whitespace
  return str.replace(/\s+/g, ' ').trim()
}
