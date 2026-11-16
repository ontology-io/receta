import * as R from 'remeda'
import { not, oneOf } from '@ontologyio/receta/predicate'
import { slugify } from '@ontologyio/receta/string'

const nextId = (taken: readonly string[], heading: string): string => {
  const slug = slugify(heading)
  const base = slug === '' ? 'section' : slug
  const withSuffix = (n: number): string => (n === 0 ? base : `${base}-${n}`)
  // One more candidate than ids taken, so at least one of them is free.
  const free = R.pipe(R.range(0, taken.length + 1), R.map(withSuffix), R.find(not(oneOf(taken))))
  return free ?? base
}

/**
 * Gives each heading on a page an anchor id, unique within the page: `setup`, `setup-1`.
 *
 * Use when: rendering Markdown or rich text with linkable headings, or building a table of
 * contents. Ids follow GitHub's style: a slug of the heading, and `-1`, `-2`, … for repeats.
 * A heading with no letters or digits gets `section`. The ids come back in the same order
 * as the headings, one per heading.
 *
 * ```text
 *  STEP                       DATA AFTER IT
 *  ─────────────────────────  ────────────────────────────────────────────
 *  headings                   ['Setup', 'Usage', 'Setup', '¿?']
 *  slugify each               'setup', 'usage', 'setup', ''
 *  blank → 'section'          'setup', 'usage', 'setup', 'section'
 *  first of base, base-1, …   ['setup', 'usage', 'setup-1', 'section']
 *  not taken by an earlier id
 * ```
 *
 * @example
 * ```ts
 * headingIds(['Setup', 'Usage', 'Setup', '¿?'])
 * // => ['setup', 'usage', 'setup-1', 'section']
 *
 * headingIds(['FAQ', 'FAQ-1', 'FAQ'])
 * // => ['faq', 'faq-1', 'faq-2']
 *
 * headingIds([])
 * // => []
 * ```
 *
 * @tags heading, anchor, id, table of contents, toc, markdown, slug, unique, hash link
 * @see slugify - @ontologyio/receta/string, turns each heading into a slug
 * @see uniqueSlug - one slug against a list that is already taken
 */
export function headingIds(headings: readonly string[]): readonly string[] {
  return R.reduce(headings, (ids: readonly string[], heading) => [...ids, nextId(ids, heading)], [])
}
