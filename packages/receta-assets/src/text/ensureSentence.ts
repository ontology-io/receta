import * as R from 'remeda'
import { capitalize, isEmpty, normalizeWhitespace } from '@ontologyio/receta/string'

const ENDS_A_SENTENCE = /[.!?…]$/
const TRAILING_SEPARATORS = /[\s,;:]+$/

/**
 * Tidies a message into a sentence: one line, a capital first letter and a closing period.
 *
 * Use when: showing error or status messages that come from APIs, validators or other
 * teams in mixed styles, such as `could not save,` or `  Invalid email`. A message already
 * ending in `.`, `!`, `?` or `…` keeps its ending; a trailing comma, colon or semicolon is
 * replaced by the period. Only the first letter changes case. An empty message stays `''`.
 *
 * @example
 * ```ts
 * ensureSentence('  could not save the file ')
 * // => 'Could not save the file.'
 *
 * ensureSentence('invalid email,')
 * // => 'Invalid email.'
 *
 * ensureSentence('Done!')
 * // => 'Done!'
 *
 * ensureSentence('   ')
 * // => ''
 * ```
 *
 * @tags sentence, message, error message, capitalize, period, punctuation, tidy, toast
 * @see capitalize - @ontologyio/receta/string, uppercases the first letter
 * @see normalizeWhitespace - @ontologyio/receta/string, puts the message on one line
 */
export function ensureSentence(message: string): string {
  const text = R.pipe(message, normalizeWhitespace, (line) => line.replace(TRAILING_SEPARATORS, ''), capitalize)
  if (isEmpty(text) || ENDS_A_SENTENCE.test(text)) return text
  return `${text}.`
}
