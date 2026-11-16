import * as R from 'remeda'
import { and, oneOf, or } from '@ontologyio/receta/predicate'

/** The server says it did not act on the request, so sending it again is safe. */
const NOT_PROCESSED = [408, 425, 429, 503]

/** The request may have been carried out before the failure. */
const MAYBE_PROCESSED = [500, 502, 504]

/** Sending these twice has the same effect as sending them once (RFC 9110). */
const IDEMPOTENT_METHODS = ['GET', 'HEAD', 'OPTIONS', 'TRACE', 'PUT', 'DELETE']

/**
 * Says whether an HTTP request that got this status is safe and worth sending again.
 *
 * Use when: deciding whether a failed call goes back to the retry loop. 408, 425, 429 and 503
 * are retried for any method, because the server didn't act on the request. 500, 502 and 504
 * are retried only for idempotent methods (GET, HEAD, OPTIONS, TRACE, PUT, DELETE), because a
 * POST or PATCH may already have taken effect. Every other status, 2xx included, is `false`.
 * The method is compared without regard to case.
 *
 * @example
 * ```ts
 * isRetryableStatus(503, 'POST')
 * // => true
 *
 * isRetryableStatus(502, 'GET')
 * // => true
 *
 * isRetryableStatus(502, 'POST')
 * // => false
 *
 * isRetryableStatus(404, 'get')
 * // => false
 *
 * R.pipe(429, isRetryableStatus('PATCH'))
 * // => true
 * ```
 *
 * @tags http, retry, status, idempotent, 429, 503, backoff, resilience
 * @see oneOf - @ontologyio/receta/predicate, the status and method lists
 * @see classifyHttpStatus - the class of a status, for logging and branching
 */
export function isRetryableStatus(status: number, method: string): boolean
export function isRetryableStatus(method: string): (status: number) => boolean
export function isRetryableStatus(...args: unknown[]): unknown {
  return R.purry(isRetryableStatusImplementation, args)
}

const isRetryableStatusImplementation = (status: number, method: string): boolean => {
  const isIdempotent = oneOf(IDEMPOTENT_METHODS)(method.toUpperCase())
  return or(oneOf(NOT_PROCESSED), and(oneOf(MAYBE_PROCESSED), R.constant(isIdempotent)))(status)
}
