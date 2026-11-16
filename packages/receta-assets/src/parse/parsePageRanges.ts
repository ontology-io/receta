import * as R from 'remeda'
import { between, not } from '@ontologyio/receta/predicate'
import { collect, err, flatMap, fromNullable, map, ok, type Result } from '@ontologyio/receta/result'
import { isBlank, trim } from '@ontologyio/receta/string'

export type ParsePageRangesError = {
  readonly code: 'INVALID_PART' | 'REVERSED_RANGE' | 'OUT_OF_RANGE'
  /** The part of the list that failed, such as `9-3`. */
  readonly input: string
  readonly message: string
}

const PART = /^(\d+)(?:\s*-\s*(\d+))?$/

const parsePart =
  (pageCount: number) =>
  (part: string): Result<readonly number[], ParsePageRangesError> => {
    const isPage = between(1, pageCount)
    return R.pipe(
      fromNullable(PART.exec(part), {
        code: 'INVALID_PART',
        input: part,
        message: `Expected a page or a range such as 3 or 2-5, got "${part}"`,
      } satisfies ParsePageRangesError),
      map(([, first = '0', last]) => [Number(first), Number(last ?? first)] as const),
      flatMap(([from, to]): Result<readonly number[], ParsePageRangesError> => {
        if (from > to) {
          return err({ code: 'REVERSED_RANGE', input: part, message: `"${part}" runs backwards` })
        }
        if (!isPage(from) || !isPage(to)) {
          return err({
            code: 'OUT_OF_RANGE',
            input: part,
            message: `"${part}" is outside pages 1 to ${pageCount}`,
          })
        }
        return ok(R.range(from, to + 1))
      }),
    )
  }

/**
 * Parses a page selection such as `1-3, 5, 8-9` into the sorted list of page numbers, checked against the page count.
 *
 * Use when: a print dialog, a PDF splitter, an export or a bulk action lets someone pick
 * pages, slides or rows the way print dialogs do. Pages are whole numbers from 1 to
 * `pageCount`; overlapping parts are merged, and the result is sorted with no duplicates.
 * Blank input is an empty list, so decide yourself whether that means "all pages". The first
 * bad part stops the parse and is named in the error.
 *
 * ```text
 *  STEP                       DATA AFTER IT
 *  ─────────────────────────  ─────────────────────────────────────
 *  input                      '8-9, 1-3, 5, 2'
 *  split ',' and trim         ['8-9', '1-3', '5', '2']
 *  R.map(parsePart)           [Ok([8, 9]), Ok([1, 2, 3]), Ok([5]), Ok([2])]
 *  collect                    Ok([[8, 9], [1, 2, 3], [5], [2]]), or first Err
 *  flat, unique, sort         Ok([1, 2, 3, 5, 8, 9])
 * ```
 *
 * @example
 * ```ts
 * parsePageRanges('8-9, 1-3, 5, 2', 10)
 * // => Ok([1, 2, 3, 5, 8, 9])
 *
 * R.pipe('', parsePageRanges(10))
 * // => Ok([])
 *
 * parsePageRanges('1-3, 9-12', 10)
 * // => Err({ code: 'OUT_OF_RANGE', input: '9-12', message: '"9-12" is outside pages 1 to 10' })
 *
 * parsePageRanges('1, 2abc', 10)
 * // => Err({ code: 'INVALID_PART', input: '2abc', message: 'Expected a page or a range such as 3 or 2-5, got "2abc"' })
 *
 * parsePageRanges('1, 5-3', 10)
 * // => Err({ code: 'REVERSED_RANGE', input: '5-3', message: '"5-3" runs backwards' })
 * ```
 *
 * @tags pages, page range, print, pdf, selection, slides, ranges, list
 * @see parseNumericRange - one range of any numbers, decimals included
 * @see collect - @ontologyio/receta/result, stops at the first bad part
 */
export function parsePageRanges(
  input: string,
  pageCount: number,
): Result<readonly number[], ParsePageRangesError>
export function parsePageRanges(
  pageCount: number,
): (input: string) => Result<readonly number[], ParsePageRangesError>
export function parsePageRanges(...args: unknown[]): unknown {
  return R.purry(parsePageRangesImplementation, args)
}

const parsePageRangesImplementation = (
  input: string,
  pageCount: number,
): Result<readonly number[], ParsePageRangesError> =>
  R.pipe(
    input,
    R.split(','),
    R.map(trim),
    R.filter(not(isBlank)),
    R.map(parsePart(pageCount)),
    (parts) => collect(parts),
    map((parts) => R.pipe(parts, R.flat(), R.unique(), R.sortBy(R.identity()))),
  )
