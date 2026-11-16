import * as R from 'remeda'
import { clamp, isInteger } from '@ontologyio/receta/number'
import { filter, flatMap, fromNullable, fromResult, map, unwrapOr } from '@ontologyio/receta/option'
import { and, gte, matches } from '@ontologyio/receta/predicate'
import { parseNumber } from '@ontologyio/receta/result'
import { trim } from '@ontologyio/receta/string'

export type ParsePaginationQuery = {
  /** The raw `page` parameter, counting from 1. */
  readonly page?: string | undefined
  /** The raw page-size parameter, whatever your API calls it: `limit`, `per_page`, `size`. */
  readonly perPage?: string | undefined
}

export type ParsePaginationSettings = {
  /** The page size when none is given or it can't be read. */
  readonly defaultPerPage: number
  /** The largest page size allowed; bigger requests are cut down to it. */
  readonly maxPerPage: number
}

export type ParsePaginationPage = {
  readonly page: number
  readonly perPage: number
  /** How many rows to skip: `(page - 1) * perPage`, ready for `OFFSET` or `.skip()`. */
  readonly offset: number
}

const isPositiveInteger = and(isInteger, gte(1))
const isDigits = matches(/^\d+$/)

const positiveInt = (text: string | undefined) =>
  R.pipe(
    fromNullable(text),
    map(trim),
    // Digits only: parseNumber alone takes '1e3' and '0x10', and Receta's parseInt reads '12abc' as 12.
    filter(isDigits),
    flatMap((value) => fromResult(parseNumber(value))),
    filter(isPositiveInteger),
  )

/**
 * Reads `page` and page-size query parameters into safe numbers and an offset, falling back to defaults instead of failing.
 *
 * Use when: a list endpoint or a table view takes `?page=` and `?limit=` from the URL, and a
 * missing, garbled or abusive value should never break the page or ask the database for a
 * million rows. Only digits count, so `2abc` and `1e3` are bad values. A bad or missing page is 1; a bad or missing size is `defaultPerPage`; a size
 * above `maxPerPage` is cut down to it. Use a Result-returning parse instead if the client
 * must be told its parameters were wrong.
 *
 * @example
 * ```ts
 * const settings = { defaultPerPage: 20, maxPerPage: 100 }
 *
 * parsePagination({ page: '3', perPage: '50' }, settings)
 * // => { page: 3, perPage: 50, offset: 100 }
 *
 * parsePagination({ page: '-1', perPage: '5000' }, settings)
 * // => { page: 1, perPage: 100, offset: 0 }
 *
 * R.pipe({ page: '2abc' }, parsePagination(settings))
 * // => { page: 1, perPage: 20, offset: 0 }
 * ```
 *
 * @tags pagination, page, limit, offset, per page, query, api, table, paging
 * @see parseIntInRange - fails instead of falling back, for strict APIs
 * @see clamp - @ontologyio/receta/number, the page-size cap
 */
export function parsePagination(
  query: ParsePaginationQuery,
  settings: ParsePaginationSettings,
): ParsePaginationPage
export function parsePagination(
  settings: ParsePaginationSettings,
): (query: ParsePaginationQuery) => ParsePaginationPage
export function parsePagination(...args: unknown[]): unknown {
  return R.purry(parsePaginationImplementation, args)
}

const parsePaginationImplementation = (
  query: ParsePaginationQuery,
  { defaultPerPage, maxPerPage }: ParsePaginationSettings,
): ParsePaginationPage => {
  const page = unwrapOr(positiveInt(query.page), 1)
  const perPage = clamp(unwrapOr(positiveInt(query.perPage), defaultPerPage), 1, maxPerPage)
  return { page, perPage, offset: (page - 1) * perPage }
}
