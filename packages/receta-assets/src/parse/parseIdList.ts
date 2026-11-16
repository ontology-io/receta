import * as R from 'remeda'
import { isInteger } from '@ontologyio/receta/number'
import { and, gt, matches, not } from '@ontologyio/receta/predicate'
import { collect, err, flatMap, mapErr, ok, parseNumber, type Result } from '@ontologyio/receta/result'
import { isBlank, trim } from '@ontologyio/receta/string'

export type ParseIdListError = {
  readonly code: 'INVALID_ID'
  /** The item that isn't an id. */
  readonly input: string
  /** Its place in the list, counting from 1 and skipping empty items. */
  readonly position: number
  readonly message: string
}

const isId = and(isInteger, gt(0))
const isDigits = matches(/^\d+$/)

const parseId = (item: string, index: number): Result<number, ParseIdListError> =>
  R.pipe(
    // Digits only: parseNumber alone takes '1e3' and '0x10', and Receta's parseInt reads '12abc' as 12.
    isDigits(item) ? parseNumber(item) : err(undefined),
    flatMap((id) => (isId(id) ? ok(id) : err(undefined))),
    mapErr((): ParseIdListError => ({
      code: 'INVALID_ID',
      input: item,
      position: index + 1,
      message: `Item ${index + 1} is not a positive whole number: "${item}"`,
    })),
  )

/**
 * Parses a comma-separated list of numeric ids such as `?ids=4,8,15`, stopping at the first item that isn't one.
 *
 * Use when: a query parameter, a CLI argument or a bulk-action field carries several
 * positive integer ids and one bad item should reject the whole request. Spaces and empty
 * items (`4,,8,`) are ignored, and blank input is an empty list. An id is digits only, so
 * `12abc`, `1e3` and `-1` are refused. The error names the first bad item and its position.
 *
 * @example
 * ```ts
 * parseIdList('4, 8,15,')
 * // => Ok([4, 8, 15])
 *
 * parseIdList('')
 * // => Ok([])
 *
 * parseIdList('4, 12abc, -1')
 * // => Err({ code: 'INVALID_ID', input: '12abc', position: 2, message: 'Item 2 is not a positive whole number: "12abc"' })
 * ```
 *
 * @tags ids, list, comma, query, bulk, integer, csv, fail-fast
 * @see validateIdList - reports every bad item, not just the first
 * @see collect - @ontologyio/receta/result, stops at the first Err
 */
export function parseIdList(input: string): Result<readonly number[], ParseIdListError> {
  return R.pipe(
    input,
    R.split(','),
    R.map(trim),
    R.filter(not(isBlank)),
    R.map(parseId),
    (results) => collect(results),
  )
}
