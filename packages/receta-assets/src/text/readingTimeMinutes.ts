import * as R from 'remeda'
import { words } from '@ontologyio/receta/string'

/**
 * Estimates how many whole minutes a text takes to read, rounding up: `5` for `5 min read`.
 *
 * Use when: a blog post, article or help page shows its reading time. Words are counted by
 * whitespace, so accented and non-Latin words count like any other. Any text with a word
 * in it takes at least one minute; an empty text takes zero. Around 200 to 250 words per
 * minute suits most adults. For HTML, run it through `htmlToPlainText` first.
 *
 * @example
 * ```ts
 * const article = R.join(R.times(450, R.constant('word')), ' ')
 *
 * readingTimeMinutes(article, 200)
 * // => 3
 *
 * readingTimeMinutes('Café ouvert', 200)
 * // => 1
 *
 * R.pipe('   ', readingTimeMinutes(200))
 * // => 0
 * ```
 *
 * @tags reading time, words per minute, article, blog, estimate, word count, read
 * @see words - @ontologyio/receta/string, splits the text into words
 */
export function readingTimeMinutes(text: string, wordsPerMinute: number): number
export function readingTimeMinutes(wordsPerMinute: number): (text: string) => number
export function readingTimeMinutes(...args: unknown[]): unknown {
  return R.purry(readingTimeMinutesImplementation, args)
}

const readingTimeMinutesImplementation = (text: string, wordsPerMinute: number): number =>
  Math.ceil(words(text, { pattern: /\s+/ }).length / wordsPerMinute)
