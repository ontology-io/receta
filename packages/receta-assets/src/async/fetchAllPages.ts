import * as R from 'remeda'
import { filter, fromNullable, isSome, none, type Option } from '@ontologyio/receta/option'
import { isNotEmpty } from '@ontologyio/receta/predicate'
import { err, isErr, ok, tryCatchAsync, type Result } from '@ontologyio/receta/result'

export type FetchAllPagesPage<T> = {
  readonly items: readonly T[]
  /** The cursor for the next page. `null`, `undefined` or `''` means this was the last page. */
  readonly nextCursor?: string | null | undefined
}

export type FetchAllPagesOptions = {
  /** Stop after this many pages, so a cursor that never runs out can't loop forever. Defaults to 100. */
  readonly maxPages?: number
}

export type FetchAllPagesError =
  | {
      readonly code: 'PAGE_FAILED'
      /** Which page failed, counting from 0. */
      readonly page: number
      /** The cursor that page was asked for, to resume from it. */
      readonly cursor: Option<string>
      /** How many items the pages before it returned. */
      readonly fetched: number
      readonly error: unknown
      readonly message: string
    }
  | { readonly code: 'TOO_MANY_PAGES'; readonly maxPages: number; readonly fetched: number; readonly message: string }

/**
 * Follows a cursor through every page of a paginated API and returns all the items in one array.
 *
 * Use when: an API such as Stripe, Slack, GitHub GraphQL or DynamoDB returns a page of items
 * and a cursor for the next one, and the caller needs all of them. `fetchPage` gets `None`
 * for the first page and `Some(cursor)` after that. Pages are fetched one at a time, since
 * each cursor comes from the page before it.
 *
 * @example
 * ```ts
 * import { unwrapOr, type Option } from '@ontologyio/receta/option'
 *
 * const pages: Record<string, { items: number[]; nextCursor: string | null }> = {
 *   first: { items: [1, 2], nextCursor: 'p2' },
 *   p2: { items: [3, 4], nextCursor: 'p3' },
 *   p3: { items: [5], nextCursor: null },
 * }
 * const listInvoices = async (cursor: Option<string>) => pages[unwrapOr(cursor, 'first')] ?? { items: [] }
 *
 * await fetchAllPages(listInvoices)
 * // => Ok([1, 2, 3, 4, 5])
 *
 * const stuckCursor = async () => ({ items: [1], nextCursor: 'same' })
 * await fetchAllPages(stuckCursor, { maxPages: 3 })
 * // => Err({ code: 'TOO_MANY_PAGES', maxPages: 3, fetched: 3, message: 'Stopped after 3 pages and the cursor had not run out' })
 * ```
 *
 * @tags pagination, cursor, pages, list all, api, next token, crawl
 * @see fetchAllByOffset - the same for APIs that page with offset and limit
 * @see tryCatchAsync - @ontologyio/receta/result, turns a failed page into an Err
 */
export async function fetchAllPages<T>(
  fetchPage: (cursor: Option<string>) => Promise<FetchAllPagesPage<T>>,
  options: FetchAllPagesOptions = {},
): Promise<Result<T[], FetchAllPagesError>> {
  const maxPages = options.maxPages ?? 100

  const fetchFrom = async (cursor: Option<string>, page: number, items: readonly T[]): Promise<Result<T[], FetchAllPagesError>> => {
    if (page >= maxPages) {
      const message = `Stopped after ${maxPages} pages and the cursor had not run out`
      return err({ code: 'TOO_MANY_PAGES', maxPages, fetched: items.length, message })
    }
    const fetched = await tryCatchAsync(
      () => fetchPage(cursor),
      (error): FetchAllPagesError => ({
        code: 'PAGE_FAILED',
        page,
        cursor,
        fetched: items.length,
        error,
        message: `Page ${page} failed`,
      }),
    )
    if (isErr(fetched)) return fetched
    const all = [...items, ...fetched.value.items]
    const next = R.pipe(fromNullable(fetched.value.nextCursor), filter<string>(isNotEmpty))
    return isSome(next) ? fetchFrom(next, page + 1, all) : ok(all)
  }

  return fetchFrom(none(), 0, [])
}
