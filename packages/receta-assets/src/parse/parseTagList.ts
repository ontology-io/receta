import * as R from 'remeda'
import { not } from '@ontologyio/receta/predicate'
import { isBlank, normalizeWhitespace } from '@ontologyio/receta/string'

/**
 * Turns typed tags like `React, react ,  Type Script` into a clean list: lowercased, single-spaced, no duplicates.
 *
 * Use when: users type tags, labels, keywords or topics into one comma-separated field and
 * `React` and ` react` must count as the same tag. The first spelling's position wins; empty
 * entries are dropped. Spaces inside a tag are kept as one space, so `Type   Script` becomes
 * `type script`; slugify the tags afterwards if they go into URLs.
 *
 * @example
 * ```ts
 * parseTagList('React, react ,  Type   Script,, TS')
 * // => ['react', 'type script', 'ts']
 *
 * parseTagList(' , ')
 * // => []
 * ```
 *
 * @tags tags, labels, keywords, topics, dedupe, lowercase, comma, input
 * @see parseCommaList - keeps case and duplicates
 * @see normalizeWhitespace - @ontologyio/receta/string, the spacing inside a tag
 */
export function parseTagList(input: string): readonly string[] {
  return R.pipe(
    input,
    R.split(','),
    R.map(normalizeWhitespace),
    R.filter(not(isBlank)),
    R.map(R.toLowerCase()),
    R.unique(),
  )
}
