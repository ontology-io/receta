import * as R from 'remeda'
import { isNotEmpty } from '@ontologyio/receta/predicate'
import { normalizeWhitespace, pluralize } from '@ontologyio/receta/string'

/**
 * Names the first few items and counts the rest: `Ana, Ben and 3 others`.
 *
 * Use when: a compact line such as "liked by", "shared with" or "assigned to" can't list
 * everyone. When only one item would be hidden, it is named instead, since `and 1 other`
 * takes as much room as the name. Names are trimmed and blank ones skipped. No names give
 * `''`.
 *
 * @example
 * ```ts
 * listWithOthers(['Ana', 'Ben', 'Cy', 'Dee', 'Eli'], 2)
 * // => 'Ana, Ben and 3 others'
 *
 * listWithOthers(['Ana', 'Ben', 'Cy'], 2)
 * // => 'Ana, Ben and Cy'
 *
 * R.pipe(['Ana', ' '], listWithOthers(2))
 * // => 'Ana'
 * ```
 *
 * @tags list, others, more, likes, participants, truncate, summary, names
 * @see pluralize - @ontologyio/receta/string, `1 other` or `3 others`
 * @see listToSentence - lists every item
 */
export function listWithOthers(names: readonly string[], shown: number): string
export function listWithOthers(shown: number): (names: readonly string[]) => string
export function listWithOthers(...args: unknown[]): unknown {
  return R.purry(listWithOthersImplementation, args)
}

const listWithOthersImplementation = (names: readonly string[], shown: number): string => {
  const kept = R.pipe(names, R.map(normalizeWhitespace), R.filter(isNotEmpty))
  // Hiding a single name saves nothing, so show it.
  const visible = kept.length - shown > 1 ? R.take(kept, Math.max(shown, 1)) : kept
  const hidden = kept.length - visible.length
  const tail = hidden > 0 ? [pluralize('other', hidden)] : R.takeLast(visible, 1)
  const head = hidden > 0 ? visible : R.dropLast(visible, 1)
  return head.length === 0 ? R.join(tail, '') : `${R.join(head, ', ')} and ${R.join(tail, '')}`
}
