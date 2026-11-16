import * as R from 'remeda'
import type { TruncateOptions } from '../types'

/**
 * Truncates a string to a maximum length.
 *
 * If the string exceeds the maximum length, it's truncated and an ellipsis
 * is appended. Can optionally truncate at word boundaries to avoid cutting words.
 *
 * The result, ellipsis included, is never longer than `length`. With `words: true` it keeps
 * as many whole words as fit, and a single word longer than the limit is cut mid-word.
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
 * // => 'Hello w…'
 *
 * truncate('The quick brown fox', { length: 15, words: true })
 * // => 'The quick...'
 *
 * truncate('hello world foo', { length: 12, words: true, ellipsis: '…' })
 * // => 'hello world…'
 *
 * truncate('Short', { length: 10 })
 * // => 'Short' (unchanged if under limit)
 *
 * // Data-last (in pipe)
 * pipe(
 *   'A very long string that needs truncation',
 *   truncate({ length: 20, words: true })
 * )
 * // => 'A very long...'
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

  const head = str.slice(0, maxLength)
  const cutsAWord = /\S$/.test(head) && /^\S/.test(str.slice(maxLength))

  if (!cutsAWord) {
    // The cut lands between words, so everything before it is whole words
    return head.trimEnd() + ellipsis
  }

  // Back up to the last whole word. One word longer than the limit is cut where it is.
  const wholeWords = head.replace(/\s+\S*$/, '')
  const kept = wholeWords.length < head.length && wholeWords.length > 0 ? wholeWords : head

  return kept + ellipsis
}
