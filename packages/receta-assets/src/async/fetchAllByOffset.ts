import { lt } from '@ontologyio/receta/predicate'
import { err, isErr, ok, tryCatchAsync, type Result } from '@ontologyio/receta/result'

export type FetchAllByOffsetOptions = {
  /** Items asked for per page. A page with fewer than this is the last one. */
  readonly pageSize: number
  /** Stop after this many pages, so an API that ignores the limit can't loop forever. Defaults to 100. */
  readonly maxPages?: number
}

export type FetchAllByOffsetError =
  | {
      readonly code: 'PAGE_FAILED'
      /** The offset that page was asked for, to resume from it. */
      readonly offset: number
      readonly error: unknown
      readonly message: string
    }
  | { readonly code: 'TOO_MANY_PAGES'; readonly maxPages: number; readonly fetched: number; readonly message: string }

/**
 * Fetches every page of an offset-and-limit API and returns all the items in one array.
 *
 * Use when: an API or a SQL query pages with `offset` and `limit` (or `skip` and `take`),
 * such as a REST admin endpoint or a table export, and the caller needs every row. A page
 * shorter than `pageSize` ends the loop, so when the total is an exact multiple of the page
 * size, one extra, empty page is fetched to find the end.
 *
 * @example
 * ```ts
 * const rows = ['a', 'b', 'c', 'd', 'e']
 * const listRows = async (offset: number, limit: number) => rows.slice(offset, offset + limit)
 *
 * await fetchAllByOffset(listRows, { pageSize: 2 })
 * // => Ok(['a', 'b', 'c', 'd', 'e'])
 *
 * const failsAtFour = async (offset: number, limit: number) =>
 *   offset === 4 ? Promise.reject('timeout') : rows.slice(offset, offset + limit)
 *
 * await fetchAllByOffset(failsAtFour, { pageSize: 2 })
 * // => Err({ code: 'PAGE_FAILED', offset: 4, error: 'timeout', message: 'The page at offset 4 failed' })
 * ```
 *
 * @tags pagination, offset, limit, skip, take, pages, list all, export
 * @see fetchAllPages - the same for APIs that page with a cursor
 * @see tryCatchAsync - @ontologyio/receta/result, turns a failed page into an Err
 */
export async function fetchAllByOffset<T>(
  fetchPage: (offset: number, limit: number) => Promise<readonly T[]>,
  options: FetchAllByOffsetOptions,
): Promise<Result<T[], FetchAllByOffsetError>> {
  const { pageSize } = options
  const maxPages = options.maxPages ?? 100
  const isLastPage = lt(pageSize)

  const fetchFrom = async (page: number, items: readonly T[]): Promise<Result<T[], FetchAllByOffsetError>> => {
    if (page >= maxPages) {
      const message = `Stopped after ${maxPages} pages and the pages were still full`
      return err({ code: 'TOO_MANY_PAGES', maxPages, fetched: items.length, message })
    }
    const offset = page * pageSize
    const fetched = await tryCatchAsync(
      () => fetchPage(offset, pageSize),
      (error): FetchAllByOffsetError => ({
        code: 'PAGE_FAILED',
        offset,
        error,
        message: `The page at offset ${offset} failed`,
      }),
    )
    if (isErr(fetched)) return fetched
    const all = [...items, ...fetched.value]
    return isLastPage(fetched.value.length) ? ok(all) : fetchFrom(page + 1, all)
  }

  return fetchFrom(0, [])
}
