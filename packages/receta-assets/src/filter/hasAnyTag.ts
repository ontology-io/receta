import * as R from 'remeda'
import { always, oneOf, type Predicate } from '@ontologyio/receta/predicate'

/**
 * Builds a predicate that keeps items carrying at least one of the selected tags, ignoring case.
 *
 * Use when: a tag cloud, label picker or category chips should widen the list with each pick,
 * so choosing `react` and `vue` shows items tagged with either. Name the field that holds the
 * item's tags. An empty selection keeps everything, as a filter with nothing picked should.
 * Items without the field, or with `null` there, are dropped once something is selected.
 *
 * @example
 * ```ts
 * const posts = [
 *   { title: 'Hooks', tags: ['React'] },
 *   { title: 'Signals', tags: ['solid', 'vue'] },
 *   { title: 'Borrowing', tags: ['rust'] },
 * ]
 *
 * R.map(R.filter(posts, hasAnyTag('tags', ['react', 'vue'])), R.prop('title'))
 * // => ['Hooks', 'Signals']
 *
 * R.filter(posts, hasAnyTag('tags', [])).length
 * // => 3
 * ```
 *
 * @tags tags, labels, categories, any, or, chips, facet, filter
 * @see hasAllTags - keeps items carrying every selected tag
 * @see facetFilter - several fields at once
 */
export function hasAnyTag<K extends PropertyKey>(
  key: K,
  selected: readonly string[],
): Predicate<{ readonly [P in K]?: readonly string[] | null | undefined }> {
  if (R.isEmpty(selected)) return always()
  const isSelected = oneOf(R.map(selected, (tag) => tag.toLowerCase()))
  return (item) => R.pipe(item[key] ?? [], R.map((tag) => tag.toLowerCase())).some(isSelected)
}
