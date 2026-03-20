import type { Trace, TracerOptions } from './types'
import type { TracerState } from './context'
import { runWithContext } from './context'
import { buildTrace } from './span'
import { activateTracing } from './activate'

/**
 * A scoped tracer that collects execution spans into a trace tree.
 */
export interface Tracer {
  /**
   * Run a synchronous function within this tracer's context.
   * All receta functions and traced() functions called within will record spans.
   *
   * @returns The function result and the collected trace
   */
  run<T>(fn: () => T): { result: T; trace: Trace }

  /**
   * Run an async function within this tracer's context.
   * All receta functions and traced() functions called within will record spans,
   * including across async boundaries.
   *
   * @returns The function result and the collected trace
   */
  runAsync<T>(fn: () => Promise<T>): Promise<{ result: T; trace: Trace }>
}

const defaultClock = (): number => performance.now()
const defaultGenerateId = (): string => crypto.randomUUID()

/**
 * Create a new tracer for collecting execution spans.
 *
 * Automatically activates the instrument hook so that core receta functions
 * (map, flatMap, filter, etc.) create spans without needing explicit wrappers.
 *
 * @example
 * ```typescript
 * const tracer = createTracer({
 *   onEvent: (event) => console.log(JSON.stringify(event))
 * })
 *
 * // Sync tracing — receta functions auto-trace
 * const { result, trace } = tracer.run(() =>
 *   pipe(ok(5), map(x => x * 2), flatMap(x => ok(x + 1)))
 * )
 *
 * // Async tracing
 * const { result, trace } = await tracer.runAsync(async () => {
 *   const user = await fetchUser(id)
 *   return user.email
 * })
 * ```
 *
 * @param options - Configuration for the tracer
 * @returns A Tracer instance
 */
export function createTracer(options: TracerOptions = {}): Tracer {
  const resolvedOptions = {
    captureInputs: options.captureInputs ?? true,
    captureOutputs: options.captureOutputs ?? true,
    maxDepth: options.maxDepth ?? Infinity,
    clock: options.clock ?? defaultClock,
    generateId: options.generateId ?? defaultGenerateId,
    onSpan: options.onSpan,
    onEvent: options.onEvent,
  }

  return {
    run<T>(fn: () => T): { result: T; trace: Trace } {
      const traceId = resolvedOptions.generateId()

      const state: TracerState = {
        options: resolvedOptions,
        rootSpans: [],
        traceId,
      }

      // Emit trace-start event (only consume clock tick when onEvent is set)
      if (resolvedOptions.onEvent) {
        resolvedOptions.onEvent({
          type: 'trace-start',
          traceId,
          timestamp: resolvedOptions.clock(),
        })
      }

      // Activate instrument hook so core receta functions auto-trace
      const deactivate = activateTracing()

      try {
        const result = runWithContext(
          {
            state,
            currentSpanId: null,
            currentSpan: null,
            depth: 0,
          },
          fn,
        )

        const trace = buildTrace(state, traceId)

        // Emit trace-end event
        if (resolvedOptions.onEvent) {
          resolvedOptions.onEvent({
            type: 'trace-end',
            traceId,
            totalDurationMs: trace.totalDurationMs,
            spanCount: trace.spans.length,
            timestamp: resolvedOptions.clock(),
          })
        }

        return { result, trace }
      } finally {
        deactivate()
      }
    },

    async runAsync<T>(fn: () => Promise<T>): Promise<{ result: T; trace: Trace }> {
      const traceId = resolvedOptions.generateId()

      const state: TracerState = {
        options: resolvedOptions,
        rootSpans: [],
        traceId,
      }

      // Emit trace-start event (only consume clock tick when onEvent is set)
      if (resolvedOptions.onEvent) {
        resolvedOptions.onEvent({
          type: 'trace-start',
          traceId,
          timestamp: resolvedOptions.clock(),
        })
      }

      // Activate instrument hook so core receta functions auto-trace
      const deactivate = activateTracing()

      try {
        const result = await runWithContext(
          {
            state,
            currentSpanId: null,
            currentSpan: null,
            depth: 0,
          },
          fn,
        )

        const trace = buildTrace(state, traceId)

        // Emit trace-end event
        if (resolvedOptions.onEvent) {
          resolvedOptions.onEvent({
            type: 'trace-end',
            traceId,
            totalDurationMs: trace.totalDurationMs,
            spanCount: trace.spans.length,
            timestamp: resolvedOptions.clock(),
          })
        }

        return { result, trace }
      } finally {
        deactivate()
      }
    },
  }
}
