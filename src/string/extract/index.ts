import * as R from 'remeda'
import { some, none, type Option } from '../../option'
import type { WordsOptions } from '../types'
import { purryConfig2 } from '../../utils/purry'

/**
 * Splits a string into an array of words.
 *
 * By default, splits on non-alphanumeric characters. Custom pattern can be provided.
 *
 * @param str - The string to split
 * @param options - Options for word splitting
 * @returns Array of words
 *
 * @example
 * ```typescript
 * // Data-first
 * words('hello world')
 * // => ['hello', 'world']
 *
 * words('user-profile-page')
 * // => ['user', 'profile', 'page']
 *
 * words('oneTwo three_four')
 * // => ['oneTwo', 'three', 'four']
 *
 * words('hello, world!')
 * // => ['hello', 'world']
 *
 * // Data-last (in pipe)
 * pipe(
 *   'The quick brown fox',
 *   words,
 *   R.map(capitalize)
 * )
 * // => ['The', 'Quick', 'Brown', 'Fox']
 * ```
 *
 * @see lines - to split by line breaks
 * @see between - to extract text between delimiters
 */
export function words(str: string, options?: WordsOptions): string[]
export function words(options: WordsOptions): (str: string) => string[]
export function words(...args: any[]): any {
  // Manual data-first/data-last detection since options is optional
  if (args.length === 1 && typeof args[0] === 'object' && args[0] !== null && !Array.isArray(args[0])) {
    // Data-last: words({options})
    const options = args[0] as WordsOptions
    return (str: string) => wordsImplementation(str, options)
  }
  // Data-first: words(str, options?)
  return wordsImplementation(args[0] as string, args[1] as WordsOptions | undefined)
}

function wordsImplementation(str: string, options?: WordsOptions): string[] {
  const { pattern = /[^a-zA-Z0-9]+/ } = options ?? {}
  return str.split(pattern).filter((word) => word.length > 0)
}

/**
 * Splits a string into an array of lines.
 *
 * Handles different line ending styles (\n, \r\n, \r).
 *
 * @param str - The string to split
 * @returns Array of lines
 *
 * @example
 * ```typescript
 * lines('hello\nworld')
 * // => ['hello', 'world']
 *
 * lines('line1\r\nline2\r\nline3')
 * // => ['line1', 'line2', 'line3']
 *
 * lines('single line')
 * // => ['single line']
 *
 * // Use with pipe
 * pipe(
 *   multilineText,
 *   lines,
 *   R.filter(line => !isEmpty(line)),
 *   R.map(trim)
 * )
 * ```
 *
 * @see words - to split by words
 */
export function lines(str: string): string[] {
  return str.split(/\r\n|\r|\n/)
}

/**
 * Extracts text between two delimiters.
 *
 * Returns Some with the extracted text if both delimiters are found,
 * None otherwise.
 *
 * @param start - The starting delimiter
 * @param end - The ending delimiter
 * @param str - The string to search
 * @returns Option containing the text between delimiters
 *
 * @example
 * ```typescript
 * // Data-first
 * between('[', ']', 'Hello [world]!')
 * // => Some('world')
 *
 * between('$', '.', 'Price: $99.99')
 * // => Some('99')
 *
 * between('[', ']', 'No delimiters')
 * // => None
 *
 * between('[', ']', '[first] and [second]')
 * // => Some('first') (only returns first match)
 *
 * // Data-last (in pipe)
 * pipe(
 *   'User ID: {12345}',
 *   between('{', '}'),
 *   unwrapOr('unknown')
 * )
 * // => '12345'
 * ```
 *
 * @see words - to split into words
 * @see lines - to split into lines
 */
export function between(start: string, end: string, str: string): Option<string>
export function between(
  start: string,
  end: string
): (str: string) => Option<string>
export function between(...args: unknown[]): unknown {
  return purryConfig2(betweenImplementation, args)
}

function betweenImplementation(start: string, end: string, str: string): Option<string> {
  const startIndex = str.indexOf(start)
  if (startIndex === -1) {
    return none()
  }

  const searchStart = startIndex + start.length
  const endIndex = str.indexOf(end, searchStart)
  if (endIndex === -1) {
    return none()
  }

  return some(str.slice(searchStart, endIndex))
}

/**
 * Extracts all matches of a pattern from a string.
 *
 * Returns an array of all matched strings.
 *
 * @param str - The string to search
 * @param pattern - The regex pattern to match (must have 'g' flag)
 * @returns Array of matched strings
 *
 * @example
 * ```typescript
 * // Data-first
 * extract('Price: $10, Discount: $5', /\$(\d+)/g)
 * // => ['$10', '$5']
 *
 * extract('user@example.com and admin@test.org', /\S+@\S+/g)
 * // => ['user@example.com', 'admin@test.org']
 *
 * extract('No matches here', /\d+/g)
 * // => []
 *
 * // Data-last (in pipe)
 * pipe(
 *   logText,
 *   extract(/\d{4}-\d{2}-\d{2}/g), // Extract dates
 *   R.unique
 * )
 * ```
 *
 * @see between - to extract text between delimiters
 */
export function extract(str: string, pattern: RegExp): string[]
export function extract(pattern: RegExp): (str: string) => string[]
export function extract(...args: unknown[]): unknown {
  return R.purry(extractImplementation, args)
}

function extractImplementation(str: string, pattern: RegExp): string[] {
  return [...str.matchAll(pattern)].map((match) => match[0]!)
}
