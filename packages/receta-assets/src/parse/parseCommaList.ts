import * as R from 'remeda'
import { not } from '@ontologyio/receta/predicate'
import { isBlank, trim } from '@ontologyio/receta/string'

/**
 * Splits text on commas and line breaks into trimmed items, dropping the empty ones.
 *
 * Use when: someone pastes a list into one field or variable, such as allowed origins,
 * recipient emails or SKUs, and writes it comma-separated, one per line, or both. Order and
 * duplicates are kept; blank input gives an empty list. It never fails, so check each item
 * afterwards if the items have a format.
 *
 * @example
 * ```ts
 * parseCommaList('ada@example.com, grace@example.com,\nlinus@example.com,')
 * // => ['ada@example.com', 'grace@example.com', 'linus@example.com']
 *
 * parseCommaList(' a ,, b ')
 * // => ['a', 'b']
 *
 * parseCommaList('   ')
 * // => []
 * ```
 *
 * @tags list, csv, comma, split, multiline, allowlist, textarea, env
 * @see parseTagList - also lowercases and removes duplicates
 * @see parseIdList - each item must be a numeric id
 */
export function parseCommaList(input: string): readonly string[] {
  return R.pipe(input, R.split(/[,\r\n]/), R.map(trim), R.filter(not(isBlank)))
}
