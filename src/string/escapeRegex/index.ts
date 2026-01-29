/**
 * Escapes special regex characters in a string to make it safe for use in RegExp.
 *
 * Escapes all regex metacharacters: . * + ? ^ $ { } ( ) | [ ] \
 *
 * This is useful when you need to use user input or arbitrary strings as literal
 * patterns in regular expressions, preventing unintended regex behavior.
 *
 * @param str - The string to escape
 * @returns The escaped string safe for RegExp
 *
 * @example
 * ```typescript
 * escapeRegex('Hello.')
 * // => 'Hello\\.'
 *
 * escapeRegex('$100 (USD)')
 * // => '\\$100 \\(USD\\)'
 *
 * escapeRegex('[a-z]+')
 * // => '\\[a-z\\]\\+'
 *
 * // Using in regex pattern
 * const userInput = 'example.com'
 * const pattern = new RegExp(escapeRegex(userInput))
 * pattern.test('example.com') // => true
 * pattern.test('exampleXcom') // => false (. is literal, not wildcard)
 *
 * // Search and replace with user input
 * const searchTerm = '$100'
 * const text = 'Price is $100 today'
 * const regex = new RegExp(escapeRegex(searchTerm), 'g')
 * text.replace(regex, '$200') // => 'Price is $200 today'
 * ```
 *
 * @see highlight - for highlighting matched text in strings
 */
export function escapeRegex(str: string): string {
  // Escape all regex special characters
  // Based on https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#escaping
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
