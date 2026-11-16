import * as R from 'remeda'
import { not } from '@ontologyio/receta/predicate'
import { err, flatMap, mapErr, ok, parseJSON, type Result } from '@ontologyio/receta/result'

export type ParseJsonArrayOfError = {
  readonly code: 'INVALID_JSON' | 'NOT_AN_ARRAY' | 'INVALID_ITEM'
  readonly input: string
  /** The first item that failed the guard, counting from 0; -1 when the whole input failed. */
  readonly index: number
  readonly message: string
}

/**
 * Parses JSON text that must be an array whose every item passes a type guard, such as a list of ids or tags.
 *
 * Use when: a list arrives as JSON, in an environment variable like `ALLOWED_IDS=[1,2,3]`,
 * a `localStorage` entry or a request field, and the code needs `T[]`, not `unknown`. Pass
 * a guard such as `isString` or `isNumber`, or your own `(value: unknown) => value is T`.
 * The error names the first item that failed and where it is.
 *
 * @example
 * ```ts
 * import { isNumber, isString } from '@ontologyio/receta/predicate'
 *
 * parseJsonArrayOf('[1, 2, 3]', isNumber)
 * // => Ok([1, 2, 3])
 *
 * R.pipe('["a", 2]', parseJsonArrayOf(isString))
 * // => Err({ code: 'INVALID_ITEM', input: '["a", 2]', index: 1, message: 'Item 1 has the wrong type' })
 *
 * parseJsonArrayOf('{"ids":[1]}', isNumber)
 * // => Err({ code: 'NOT_AN_ARRAY', input: '{"ids":[1]}', index: -1, message: 'Expected a JSON array' })
 * ```
 *
 * @tags json, array, list, guard, typed, env, localstorage, decode
 * @see parseJsonAs - an object checked field by field
 * @see parseJSON - @ontologyio/receta/result, the parse underneath
 */
export function parseJsonArrayOf<T>(
  input: string,
  isItem: (value: unknown) => value is T,
): Result<readonly T[], ParseJsonArrayOfError>
export function parseJsonArrayOf<T>(
  isItem: (value: unknown) => value is T,
): (input: string) => Result<readonly T[], ParseJsonArrayOfError>
export function parseJsonArrayOf(...args: unknown[]): unknown {
  return R.purry(parseJsonArrayOfImplementation, args)
}

const parseJsonArrayOfImplementation = <T>(
  input: string,
  isItem: (value: unknown) => value is T,
): Result<readonly T[], ParseJsonArrayOfError> =>
  R.pipe(
    parseJSON<unknown>(input),
    mapErr((error): ParseJsonArrayOfError => ({
      code: 'INVALID_JSON',
      input,
      index: -1,
      message: `Not valid JSON: ${error.message}`,
    })),
    flatMap((value): Result<readonly T[], ParseJsonArrayOfError> => {
      if (!R.isArray(value)) {
        return err({ code: 'NOT_AN_ARRAY', input, index: -1, message: 'Expected a JSON array' })
      }
      if (value.every(isItem)) return ok(value)
      const index = R.findIndex(value, not(isItem))
      return err({ code: 'INVALID_ITEM', input, index, message: `Item ${index} has the wrong type` })
    }),
  )
