import * as R from 'remeda'
import { between } from '@ontologyio/receta/predicate'
import { parseNumber } from '@ontologyio/receta/result'
import {
  collectErrors,
  flatMap,
  fromPredicate,
  fromResult,
  integer,
  invalid,
  map,
  mapInvalid,
  match,
  valid,
  validate,
  type FieldError,
  type Validation,
} from '@ontologyio/receta/validation'

export type ValidatePaginationParamsQuery = {
  readonly page?: string | undefined
  readonly pageSize?: string | undefined
}

export type ValidatePaginationParamsLimits = {
  /** Page size when the query has none. */
  readonly defaultPageSize: number
  /** Largest page size a caller may ask for. */
  readonly maxPageSize: number
}

export type ValidatePaginationParamsResult = {
  readonly page: number
  readonly pageSize: number
}

const rangeMessage = (name: string, most: number): string =>
  most === Infinity ? `${name} must be 1 or more` : `${name} must be between 1 and ${most}`

/** A blank value takes the default; anything else must be a whole number from 1 to `most`. */
const param = (name: string, raw: string | undefined, fallback: number, most: number): Validation<number, FieldError<string>> =>
  R.pipe(
    raw?.trim() ?? '',
    (text) =>
      text === ''
        ? valid(fallback)
        : R.pipe(
            fromResult(parseNumber(text)),
            mapInvalid(() => `${name} must be a whole number`),
            flatMap(
              validate([
                integer(`${name} must be a whole number`),
                fromPredicate(between(1, most), rangeMessage(name, most)),
              ]),
            ),
          ),
    // One entry per parameter, holding all of that parameter's messages.
    match<number, string, Validation<number, FieldError<string>>>({
      onValid: valid,
      onInvalid: (errors) => invalid({ field: name, errors }),
    }),
  )

/**
 * Reads `page` and `pageSize` from a query string, with defaults, and reports every bad one.
 *
 * Use when: an HTTP handler for a list endpoint receives `?page=2&pageSize=50` and must answer
 * 400 with clear messages for `page=0` or `pageSize=9999` instead of running a bad query.
 * A missing or blank value takes its default: page 1 and `defaultPageSize`. Values are parsed
 * as numbers, so `2abc` and `1.5` are refused. Pages are 1-based.
 *
 * @example
 * ```ts
 * validatePaginationParams({ page: '3', pageSize: '' }, { defaultPageSize: 20, maxPageSize: 100 })
 * // => Valid({ page: 3, pageSize: 20 })
 *
 * validatePaginationParams({ page: '0', pageSize: '500' }, { defaultPageSize: 20, maxPageSize: 100 })
 * // => Invalid([
 * //   { field: 'page', errors: ['page must be 1 or more'] },
 * //   { field: 'pageSize', errors: ['pageSize must be between 1 and 100'] },
 * // ])
 *
 * R.pipe({ page: '2abc' }, validatePaginationParams({ defaultPageSize: 20, maxPageSize: 100 }))
 * // => Invalid([{ field: 'page', errors: ['page must be a whole number'] }])
 * ```
 *
 * @tags pagination, page, limit, offset, query, params, api, http, 400
 * @see parseNumber - @ontologyio/receta/result, the number parse, which refuses `2abc`
 * @see collectErrors - @ontologyio/receta/validation, keeps both parameters' errors
 */
export function validatePaginationParams(
  query: ValidatePaginationParamsQuery,
  limits: ValidatePaginationParamsLimits,
): Validation<ValidatePaginationParamsResult, FieldError<string>>
export function validatePaginationParams(
  limits: ValidatePaginationParamsLimits,
): (query: ValidatePaginationParamsQuery) => Validation<ValidatePaginationParamsResult, FieldError<string>>
export function validatePaginationParams(...args: unknown[]): unknown {
  return R.purry(validatePaginationParamsImplementation, args)
}

const validatePaginationParamsImplementation = (
  query: ValidatePaginationParamsQuery,
  limits: ValidatePaginationParamsLimits,
): Validation<ValidatePaginationParamsResult, FieldError<string>> =>
  R.pipe(
    collectErrors([
      param('page', query.page, 1, Infinity),
      param('pageSize', query.pageSize, limits.defaultPageSize, limits.maxPageSize),
    ]),
    // collectErrors gives back number[], not a pair, so the defaults only satisfy the index types.
    map(([page = 1, pageSize = limits.defaultPageSize]) => ({ page, pageSize })),
  )
