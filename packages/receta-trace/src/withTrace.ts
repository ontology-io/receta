/**
 * Convenience API for tracing receta function pipelines.
 *
 * Combines tracer creation, hook activation, execution, and cleanup
 * into a single function call.
 *
 * @module withTrace
 */

import type { Trace, TracerOptions } from './types'
import { createTracer } from './tracer'

/**
 * Run a synchronous function with tracing enabled.
 *
 * All receta functions (map, flatMap, filter, etc.) called within the callback
 * automatically create trace spans. Real-time JSON events fire via `onEvent`.
 *
 * @example
 * ```typescript
 * import { ok, map, flatMap } from '@ontologyio/receta/result'
 * import { withTrace } from '@ontologyio/receta-trace'
 * import * as R from 'remeda'
 *
 * const { result, trace } = withTrace({
 *   onEvent: (event) => console.log(JSON.stringify(event))
 * }, () => {
 *   return R.pipe(
 *     ok(5),
 *     map(x => x * 2),
 *     flatMap(x => ok(x + 1))
 *   )
 * })
 * ```
 */
export function withTrace<T>(
  options: TracerOptions,
  fn: () => T,
): { result: T; trace: Trace } {
  const tracer = createTracer(options)
  return tracer.run(fn)
}

/**
 * Run an async function with tracing enabled.
 *
 * All receta functions called within the callback automatically create trace spans,
 * including across async boundaries. Real-time JSON events fire via `onEvent`.
 *
 * @example
 * ```typescript
 * import { withTraceAsync } from '@ontologyio/receta-trace'
 *
 * const { result, trace } = await withTraceAsync({
 *   onEvent: (event) => ws.send(JSON.stringify(event))
 * }, async () => {
 *   const data = await pipeAsync(
 *     userId,
 *     fetchUser,
 *     validateUser,
 *     formatResponse
 *   )
 *   return data
 * })
 * ```
 */
export async function withTraceAsync<T>(
  options: TracerOptions,
  fn: () => Promise<T>,
): Promise<{ result: T; trace: Trace }> {
  const tracer = createTracer(options)
  return tracer.runAsync(fn)
}
