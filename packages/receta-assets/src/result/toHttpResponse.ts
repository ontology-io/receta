import * as R from 'remeda'
import { fromNullable, match as matchOption } from '@ontologyio/receta/option'
import { match, type Result } from '@ontologyio/receta/result'

export type ToHttpResponseOptions<E extends { readonly code: string }> = {
  /** The status for an Ok. Defaults to 200; use 201 after a create. */
  readonly okStatus?: number
  /** The status per error code. Codes left out become a 500 with a generic body. */
  readonly statusByCode: { readonly [C in E['code']]?: number }
}

export type ToHttpResponseErrorBody = {
  readonly error: { readonly code: string; readonly message: string }
}

export type ToHttpResponseReply<T> =
  | { readonly status: number; readonly body: T }
  | { readonly status: number; readonly body: ToHttpResponseErrorBody }

const INTERNAL_ERROR: ToHttpResponseErrorBody = {
  error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' },
}

/**
 * Turns a Result into an HTTP status and JSON body, mapping error codes to statuses and hiding unmapped errors behind a 500.
 *
 * Use when: a route handler ends with a `Result` and must answer, in Express, Hono, Next.js
 * route handlers or a Lambda. An `Ok` becomes `okStatus` with the value as the body. A
 * listed error code gets its status and `{ error: { code, message } }`. Any other code
 * becomes a 500 with a generic body, so internal messages such as SQL errors never reach the
 * client; log the original error yourself.
 *
 * ```text
 *             ┌───────┐  Ok(value)          ╭────────────────────────────────╮
 *  result ──▶ │ match │────────────────────▶│ okStatus, the value as body    │
 *             └───┬───┘                     ╰────────────────────────────────╯
 *                 │ Err({ code, message })
 *                 ▼                         ╭────────────────────────────────╮
 *     ⟨ code in statusByCode? ⟩──yes───────▶│ its status,                    │
 *                 │ no                      │ { error: { code, message } }   │
 *                 ▼                         ╰────────────────────────────────╯
 *       ╭────────────────────────────────╮
 *       │ 500, { error: INTERNAL_ERROR } │
 *       ╰────────────────────────────────╯
 * ```
 *
 * @example
 * ```ts
 * import { err, ok, type Result } from '@ontologyio/receta/result'
 *
 * type ApiError = { code: 'NOT_FOUND' | 'INVALID' | 'DB_DOWN'; message: string }
 * const options = { statusByCode: { NOT_FOUND: 404, INVALID: 400 } }
 * const found: Result<{ id: number }, ApiError> = ok({ id: 7 })
 * const missing: Result<{ id: number }, ApiError> = err({ code: 'NOT_FOUND', message: 'No order 9' })
 * const down: Result<{ id: number }, ApiError> = err({ code: 'DB_DOWN', message: 'ECONNREFUSED 10.0.0.5' })
 *
 * toHttpResponse(found, { ...options, okStatus: 201 })
 * // => { status: 201, body: { id: 7 } }
 *
 * toHttpResponse(missing, options)
 * // => { status: 404, body: { error: { code: 'NOT_FOUND', message: 'No order 9' } } }
 *
 * R.pipe(down, toHttpResponse(options))
 * // => { status: 500, body: { error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' } } }
 * ```
 *
 * @tags http, response, status code, api, route handler, rest, express, error mapping
 * @see toUserMessage - the same decision for a sentence in the UI
 * @see renameErrorCodes - translate low-level codes before choosing a status
 */
export function toHttpResponse<T, E extends { readonly code: string; readonly message: string }>(
  result: Result<T, E>,
  options: ToHttpResponseOptions<E>,
): ToHttpResponseReply<T>
export function toHttpResponse<T, E extends { readonly code: string; readonly message: string }>(
  options: ToHttpResponseOptions<E>,
): (result: Result<T, E>) => ToHttpResponseReply<T>
export function toHttpResponse(...args: unknown[]): unknown {
  return R.purry(toHttpResponseImplementation, args)
}

const toHttpResponseImplementation = <
  T,
  E extends { readonly code: string; readonly message: string },
>(
  result: Result<T, E>,
  { okStatus = 200, statusByCode }: ToHttpResponseOptions<E>,
): ToHttpResponseReply<T> =>
  match(result, {
    onOk: (body): ToHttpResponseReply<T> => ({ status: okStatus, body }),
    onErr: ({ code, message }): ToHttpResponseReply<T> =>
      matchOption(fromNullable<number>(statusByCode[code as E['code']]), {
        onSome: (status): ToHttpResponseReply<T> => ({ status, body: { error: { code, message } } }),
        onNone: (): ToHttpResponseReply<T> => ({ status: 500, body: INTERNAL_ERROR }),
      }),
  })
