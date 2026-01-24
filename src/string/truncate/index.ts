import * as R from 'remeda'
import type { TruncateOptions } from '../types'

/**
 * Truncates a string to a maximum length.
 *
 * If the string exceeds the maximum length, it's truncated and an ellipsis
 * is appended. Can optionally truncate at word boundaries to avoid cutting words.
 *
 * @param str - The string to truncate
 * @param options - Truncation options
 * @returns The truncated string
 *
 * @example
 * ```typescript
 * // Data-first
 * truncate('Hello world', { length: 8 })
 * // => 'Hello...'
 *
 * truncate('Hello world', { length: 8, ellipsis: '…' })
 * // => 'Hello…'
 *
 * truncate('The quick brown fox', { length: 15, words: true })
 * // => 'The quick...'
 *
 * truncate('Short', { length: 10 })
 * // => 'Short' (unchanged if under limit)
 *
 * // Data-last (in pipe)
 * pipe(
 *   'A very long string that needs truncation',
 *   truncate({ length: 20, words: true })
 * )
 * // => 'A very long string...'
 * ```
 *
 * @see words - to split a string into words
 */
export function truncate(str: string, options: TruncateOptions): string
export function truncate(options: TruncateOptions): (str: string) => string
export function truncate(...args: unknown[]): unknown {
  return R.purry(truncateImplementation, args)
}

function truncateImplementation(str: string, options: TruncateOptions): string {
  const { length, ellipsis = '...', words = false } = options

  if (str.length <= length) {
    return str
  }

  const maxLength = length - ellipsis.length

  if (maxLength <= 0) {
    return ellipsis.slice(0, length)
  }

  if (!words) {
    return str.slice(0, maxLength) + ellipsis
  }

  // Truncate at word boundary
  const truncated = str.slice(0, maxLength + 1) // Look one character ahead
  const lastSpace = truncated.trimEnd().lastIndexOf(' ')

  if (lastSpace === -1) {
    // No space found, truncate at character boundary
    return str.slice(0, maxLength) + ellipsis
  }

  return truncated.slice(0, lastSpace) + ellipsis
}
