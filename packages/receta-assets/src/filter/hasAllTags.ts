import * as R from 'remeda'
import { always, oneOf, type Predicate } from '@ontologyio/receta/predicate'

/**
 * Builds a predicate that keeps items carrying every one of the selected tags, ignoring case.
 *
 * Use when: each picked tag should narrow the list, as in "show recipes that are both `vegan`
 * and `quick`", or skills a candidate must all have. Name the field that holds the item's
 * tags. Extra tags on the item don't matter. An empty selection keeps everything. Items
 * without the field, or with `null` there, are dropped once something is selected.
 *
 * @example
 * ```ts
 * const recipes = [
 *   { name: 'Dal', tags: ['vegan', 'quick', 'indian'] },
 *   { name: 'Ragu', tags: ['slow', 'italian'] },
 *   { name: 'Salad', tags: ['Vegan'] },
 * ]
 *
 * R.map(R.filter(recipes, hasAllTags('tags', ['vegan', 'quick'])), R.prop('name'))
 * // => ['Dal']
 *
 * R.map(R.filter(recipes, hasAllTags('tags', ['VEGAN'])), R.prop('name'))
 * // => ['Dal', 'Salad']
 *
 * R.filter(recipes, hasAllTags('tags', [])).length
 * // => 3
 * ```
 *
 * @tags tags, labels, all, and, every, narrow, skills, facet, filter
 * @see hasAnyTag - keeps items carrying any selected tag
 */
export function hasAllTags<K extends PropertyKey>(
  key: K,
  selected: readonly string[],
): Predicate<{ readonly [P in K]?: readonly string[] | null | undefined }> {
  if (R.isEmpty(selected)) return always()
  const wanted = R.map(selected, (tag) => tag.toLowerCase())
  return (item) => {
    const carries = oneOf(R.map(item[key] ?? [], (tag) => tag.toLowerCase()))
    return wanted.every(carries)
  }
}
