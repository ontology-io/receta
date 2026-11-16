import * as R from 'remeda'
import { switchCase } from '@ontologyio/receta/function'
import { gte, or, where } from '@ontologyio/receta/predicate'

export type LogLevelForResponseEntry = {
  readonly status: number
  readonly durationMs: number
}

export type LogLevelForResponseOptions = {
  /** A response that takes at least this long is logged as a warning. */
  readonly slowMs: number
}

export type LogLevelForResponseLevel = 'error' | 'warn' | 'info'

/**
 * Picks the log level for a finished HTTP request from its status and how long it took.
 *
 * Use when: an access-log middleware, a fetch wrapper or a tracing hook writes one line per
 * request and the noise level matters: 5xx is `error`, 4xx or a response at or over `slowMs` is
 * `warn`, everything else is `info`. Status wins over time, so a slow 500 is still an error.
 *
 * @example
 * ```ts
 * logLevelForResponse({ status: 200, durationMs: 85 }, { slowMs: 1000 })
 * // => 'info'
 *
 * logLevelForResponse({ status: 200, durationMs: 2400 }, { slowMs: 1000 })
 * // => 'warn'
 *
 * R.pipe({ status: 503, durationMs: 4000 }, logLevelForResponse({ slowMs: 1000 }))
 * // => 'error'
 * ```
 *
 * @tags log, logging, level, http, request, access log, slow, latency, middleware
 * @see switchCase - @ontologyio/receta/function, the rules in order with `info` as the fallback
 * @see classifyHttpStatus - the status class on its own
 */
export function logLevelForResponse(
  entry: LogLevelForResponseEntry,
  options: LogLevelForResponseOptions,
): LogLevelForResponseLevel
export function logLevelForResponse(
  options: LogLevelForResponseOptions,
): (entry: LogLevelForResponseEntry) => LogLevelForResponseLevel
export function logLevelForResponse(...args: unknown[]): unknown {
  return R.purry(logLevelForResponseImplementation, args)
}

const logLevelForResponseImplementation = (
  entry: LogLevelForResponseEntry,
  options: LogLevelForResponseOptions,
): LogLevelForResponseLevel =>
  switchCase<LogLevelForResponseEntry, LogLevelForResponseLevel>(
    [
      [where({ status: gte(500) }), R.constant('error')],
      [or(where({ status: gte(400) }), where({ durationMs: gte(options.slowMs) })), R.constant('warn')],
    ],
    'info',
    entry,
  )
