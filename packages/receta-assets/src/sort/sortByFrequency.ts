import * as R from 'remeda'
import { descending } from '@ontologyio/receta/compare'

/**
 * Lists each distinct value once, the most frequent first, with ties in the order they first appear.
 *
 * Use when: suggesting the most used tags first in an autocomplete, ordering categories by
 * popularity, or showing which errors happen most. Values compare exactly, so normalize case
 * first if 'Bug' and 'bug' are the same tag. For the counts themselves, use `frequencyTable`
 * from the collection assets.
 *
 * @example
 * ```ts
 * sortByFrequency(['ui', 'bug', 'api', 'bug', 'ui', 'bug'])
 * // => ['bug', 'ui', 'api']
 *
 * sortByFrequency([3, 1, 2, 1, 3])
 * // => [3, 1, 2]
 *
 * sortByFrequency([])
 * // => []
 * ```
 *
 * @tags sort, frequency, popularity, most common, most used, tags, suggestions, autocomplete, count
 * @see sortByCustomOrder - a fixed order instead of a counted one
 * @see descending - @ontologyio/receta/compare, the most-frequent-first order
 */
export function sortByFrequency<T extends string | number>(values: readonly T[]): readonly T[] {
  const counts = R.countBy(values, String)
  // R.unique keeps first appearances in order, and the stable sort keeps that order on ties.
  return R.pipe(
    values,
    R.unique(),
    R.sort(descending((value: T) => counts[String(value)] ?? 0)),
  )
}
