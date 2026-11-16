import * as R from 'remeda'
import { clamp } from '@ontologyio/receta/number'

export type PageNumbersOptions = {
  /** The page being shown, 1-based. Out-of-range values are clamped. */
  readonly current: number
  readonly totalPages: number
  /** How many pages to show on each side of the current one. Defaults to 1. */
  readonly siblings?: number
}

/** A page number to show as a button, or `'gap'` where an ellipsis goes. */
export type PageNumbersItem = number | 'gap'

/**
 * Lists the page buttons for a pager, with gaps for the hidden pages: 1 … 5 6 7 … 20.
 *
 * Use when: rendering numbered pagination under a table or search results. The first and last
 * pages always show, with `siblings` pages on each side of the current one. The list keeps the
 * same length on every page, so the buttons don't jump around as the user clicks, and a gap
 * that would hide a single page near either end shows that page instead.
 *
 * @example
 * ```ts
 * pageNumbers({ current: 6, totalPages: 20 })
 * // => [1, 'gap', 5, 6, 7, 'gap', 20]
 *
 * pageNumbers({ current: 2, totalPages: 20 })
 * // => [1, 2, 3, 4, 5, 'gap', 20]
 *
 * pageNumbers({ current: 19, totalPages: 20, siblings: 2 })
 * // => [1, 'gap', 14, 15, 16, 17, 18, 19, 20]
 *
 * pageNumbers({ current: 1, totalPages: 4 })
 * // => [1, 2, 3, 4]
 * ```
 *
 * @tags pagination, pager, page numbers, ellipsis, gap, navigation, buttons, truncated pages
 * @see paginateClamped - the page of items and the totals this needs
 * @see clamp - @ontologyio/receta/number, keeps the current page and the window in range
 */
export function pageNumbers(options: PageNumbersOptions): readonly PageNumbersItem[] {
  const totalPages = Math.max(0, Math.floor(options.totalPages))
  const siblings = Math.max(0, Math.floor(options.siblings ?? 1))
  // first, last, current, siblings on both sides, and one slot per gap
  const slots = 2 * siblings + 5
  if (totalPages <= slots) return R.range(1, totalPages + 1)

  const current = clamp(options.current, 1, totalPages)
  // The window around the current page slides, but never over page 2 or the second-to-last page.
  const windowStart = clamp(current - siblings, 3, totalPages - 2 - 2 * siblings)
  const windowEnd = windowStart + 2 * siblings
  const left: readonly PageNumbersItem[] = windowStart === 3 ? [2] : ['gap']
  const right: readonly PageNumbersItem[] = windowEnd === totalPages - 2 ? [totalPages - 1] : ['gap']
  return [1, ...left, ...R.range(windowStart, windowEnd + 1), ...right, totalPages]
}
