import * as R from 'remeda'

/**
 * Options for truncateWords function.
 */
export interface TruncateWordsOptions {
  /**
   * The string to append when truncated.
   *
   * @default '...'
   */
  readonly suffix?: string
}

/**
 * Truncates a string to a maximum number of words.
 *
 * Unlike character-based truncation, this preserves complete words and truncates
 * at word boundaries. Words are determined by whitespace.
 *
 * @param str - The string to truncate
 * @param maxWords - Maximum number of words to keep
 * @param options - Truncation options
 * @returns The truncated string
 *
 * @example
 * ```typescript
 * // Data-first
 * truncateWords('The quick brown fox jumps', 3)
 * // => 'The quick brown...'
 *
 * truncateWords('Hello world', 5)
 * // => 'Hello world' (unchanged if under limit)
 *
 * truncateWords('One two three four', 2, { suffix: ' […]' })
 * // => 'One two […]'
 *
 * truncateWords('Single', 3)
 * // => 'Single' (no suffix if not truncated)
 *
 * // Data-last (in pipe)
 * pipe(
 *   'A long article preview with many words in it',
 *   truncateWords(5)
 * )
 * // => 'A long article preview with...'
 * ```
 *
 * @see truncate - for character-based truncation
 * @see words - to split a string into words
 */
export function truncateWords(
  str: string,
  maxWords: number,
  options?: TruncateWordsOptions
): string
export function truncateWords(
  maxWords: number,
  options?: TruncateWordsOptions
): (str: string) => string
export function truncateWords(...args: any[]): unknown {
  // Handle data-first: truncateWords(str, maxWords, options?)
  if (args.length >= 2 && typeof args[0] === 'string') {
    return truncateWordsImplementation(args[0], args[1], args[2])
  }

  // Handle data-last: truncateWords(maxWords, options?)(str)
  const maxWords = args[0] as number
  const options = args[1] as TruncateWordsOptions | undefined
  return (str: string) => truncateWordsImplementation(str, maxWords, options)
}

function truncateWordsImplementation(
  str: string,
  maxWords: number,
  options: TruncateWordsOptions = {}
): string {
  const { suffix = '...' } = options

  if (maxWords <= 0) {
    return suffix
  }

  const trimmed = str.trim()
  if (trimmed.length === 0) {
    return ''
  }

  // Split by whitespace
  const allWords = trimmed.split(/\s+/)

  // If word count is within limit, return as-is
  if (allWords.length <= maxWords) {
    return str
  }

  // Take first maxWords and append suffix
  const truncated = allWords.slice(0, maxWords).join(' ')
  return truncated + suffix
}
