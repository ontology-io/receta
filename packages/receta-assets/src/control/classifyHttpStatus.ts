import * as R from 'remeda'
import { switchCase } from '@ontologyio/receta/function'
import { none, some, type Option } from '@ontologyio/receta/option'
import { between, isInteger } from '@ontologyio/receta/predicate'

export type ClassifyHttpStatusClass =
  | 'informational'
  | 'success'
  | 'redirect'
  | 'client_error'
  | 'server_error'

const byHundreds = switchCase<number, Option<ClassifyHttpStatusClass>>(
  [
    [between(100, 199), R.constant(some('informational'))],
    [between(200, 299), R.constant(some('success'))],
    [between(300, 399), R.constant(some('redirect'))],
    [between(400, 499), R.constant(some('client_error'))],
    [between(500, 599), R.constant(some('server_error'))],
  ],
  none(),
)

/**
 * Names the class of an HTTP status code: informational, success, redirect, client or server error.
 *
 * Use when: a fetch wrapper, a logger or a metrics label needs to branch on the kind of response
 * instead of listing codes. A number outside 100–599, or one that isn't whole, comes back as
 * `None`, so a corrupted status can't pass for a success.
 *
 * @example
 * ```ts
 * classifyHttpStatus(204)
 * // => Some('success')
 *
 * classifyHttpStatus(503)
 * // => Some('server_error')
 *
 * classifyHttpStatus(0)
 * // => None
 *
 * classifyHttpStatus(200.5)
 * // => None
 * ```
 *
 * @tags http, status, response, classify, 4xx, 5xx, success, error, fetch
 * @see switchCase - @ontologyio/receta/function, the first-match table underneath
 * @see isRetryableStatus - which of these statuses are worth another attempt
 */
export function classifyHttpStatus(status: number): Option<ClassifyHttpStatusClass> {
  return isInteger(status) ? byHundreds(status) : none()
}
