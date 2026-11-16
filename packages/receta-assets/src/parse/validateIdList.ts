import * as R from 'remeda'
import { isInteger } from '@ontologyio/receta/number'
import { and, gt, matches, not } from '@ontologyio/receta/predicate'
import { err, match, parseNumber } from '@ontologyio/receta/result'
import { isBlank, trim } from '@ontologyio/receta/string'
import { collectErrors, fromPredicate, invalid, type Validation } from '@ontologyio/receta/validation'

export type ValidateIdListError = {
  readonly code: 'INVALID_ID'
  /** The item that isn't an id. */
  readonly input: string
  /** Its place in the list, counting from 1 and skipping empty items. */
  readonly position: number
  readonly message: string
}

const isId = and(isInteger, gt(0))
const isDigits = matches(/^\d+$/)

const validateId = (item: string, index: number): Validation<number, ValidateIdListError> => {
  const problem: ValidateIdListError = {
    code: 'INVALID_ID',
    input: item,
    position: index + 1,
    message: `Item ${index + 1} is not a positive whole number: "${item}"`,
  }
  // Digits only: parseNumber alone takes '1e3' and '0x10', and Receta's parseInt reads '12abc' as 12.
  return match(isDigits(item) ? parseNumber(item) : err(undefined), {
    onOk: fromPredicate(isId, problem),
    onErr: (): Validation<number, ValidateIdListError> => invalid(problem),
  })
}

/**
 * Parses a comma-separated list of numeric ids and reports every item that isn't one, not just the first.
 *
 * Use when: a person typed or pasted the list, such as order numbers in an admin form or a
 * spreadsheet column, and should fix every mistake in one go. Spaces and empty items are
 * ignored, and an id is digits only, so `12abc` and `1e3` are refused. `Valid` carries the ids in order; `Invalid` lists each bad item with its position.
 *
 * @example
 * ```ts
 * validateIdList('4, 8, 15')
 * // => Valid([4, 8, 15])
 *
 * validateIdList('4, 12abc, 2.5')
 * // => Invalid([
 * //   { code: 'INVALID_ID', input: '12abc', position: 2, message: 'Item 2 is not a positive whole number: "12abc"' },
 * //   { code: 'INVALID_ID', input: '2.5', position: 3, message: 'Item 3 is not a positive whole number: "2.5"' },
 * // ])
 * ```
 *
 * @tags ids, list, comma, form, bulk, integer, validation, all errors
 * @see parseIdList - stops at the first bad item and returns a Result
 * @see collectErrors - @ontologyio/receta/validation, gathers every Invalid
 */
export function validateIdList(input: string): Validation<readonly number[], ValidateIdListError> {
  return R.pipe(
    input,
    R.split(','),
    R.map(trim),
    R.filter(not(isBlank)),
    R.map(validateId),
    (validations) => collectErrors(validations),
  )
}
