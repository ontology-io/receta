import * as R from 'remeda'
import { paginate } from '@ontologyio/receta/collection'
import { clamp } from '@ontologyio/receta/number'

export type PaginateClampedOptions = {
  /** The 1-based page asked for, often straight from a `?page=` query. */
  readonly page: number
  readonly pageSize: number
}

export type PaginateClampedPage<T> = {
  readonly items: readonly T[]
  /** The page actually shown, after clamping. */
  readonly page: number
  readonly pageSize: number
  readonly total: number
  /** At least 1, so an empty list still has a page to show. */
  readonly totalPages: number
  readonly hasNext: boolean
  readonly hasPrevious: boolean
  /** 1-based number of the first item on the page, 0 when the page is empty. */
  readonly from: number
  /** 1-based number of the last item on the page, 0 when the page is empty. */
  readonly to: number
}

/**
 * Cuts one page out of a list, clamping a page number that is out of range, with the numbers a pager needs.
 *
 * Use when: a table or list reads the page from the URL, where `?page=99`, `?page=0` or
 * `?page=abc` must show a real page instead of an empty one. A page past the end shows the last
 * page, and anything below 1 or not a number shows page 1. `from` and `to` fill "Showing 21–40
 * of 95". A `pageSize` below 1 counts as 1.
 *
 * @example
 * ```ts
 * const rows = R.range(1, 96)
 *
 * R.pipe(rows, paginateClamped({ page: 2, pageSize: 20 }), R.omit(['items']))
 * // => { page: 2, pageSize: 20, total: 95, totalPages: 5, hasNext: true, hasPrevious: true, from: 21, to: 40 }
 *
 * const last = paginateClamped(rows, { page: 99, pageSize: 20 })
 * const shown = { page: last.page, from: last.from, to: last.to, hasNext: last.hasNext }
 * // => { page: 5, from: 81, to: 95, hasNext: false }
 *
 * paginateClamped([], { page: Number('abc'), pageSize: 10 })
 * // => { items: [], page: 1, pageSize: 10, total: 0, totalPages: 1, hasNext: false, hasPrevious: false, from: 0, to: 0 }
 * ```
 *
 * @tags paginate, pagination, page, pager, table, clamp, out of range, showing x of y, offset
 * @see pageNumbers - the page buttons to show for the result
 * @see paginate - @ontologyio/receta/collection, the page cut without clamping
 */
export function paginateClamped<T>(items: readonly T[], options: PaginateClampedOptions): PaginateClampedPage<T>
export function paginateClamped<T>(options: PaginateClampedOptions): (items: readonly T[]) => PaginateClampedPage<T>
export function paginateClamped(...args: unknown[]): unknown {
  return R.purry(paginateClampedImplementation, args)
}

const paginateClampedImplementation = <T>(
  items: readonly T[],
  options: PaginateClampedOptions,
): PaginateClampedPage<T> => {
  const pageSize = Math.max(1, Math.floor(options.pageSize))
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  // NaN fails every comparison inside clamp, so a page that isn't a number becomes 1 first.
  const asked = Number.isFinite(options.page) ? Math.floor(options.page) : 1
  const page = clamp(asked, 1, totalPages)
  const result = paginate(items, { page, pageSize })
  const from = result.items.length === 0 ? 0 : (page - 1) * pageSize + 1
  const to = result.items.length === 0 ? 0 : from + result.items.length - 1
  return { ...result, totalPages, from, to }
}
