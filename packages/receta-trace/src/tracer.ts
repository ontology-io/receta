import type { Trace, TracerOptions } from './types'
import type { TracerState } from './context'
import { runWithContext } from './context'
import { buildTrace } from './span'

/**
 * A scoped tracer that collects execution spans into a trace tree.
 */
export interface Tracer {
  /**
   * Run a synchronous function within this tracer's context.
   * All traced() functions called within will record spans.
   *
   * @returns The function result and the collected trace
   */
  run<T>(fn: () => T): { result: T; trace: Trace }

  /**
   * Run an async function within this tracer's context.
   * All traced() functions called within will record spans,
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
 * @example
 * ```typescript
 * const tracer = createTracer()
 *
 * // Sync tracing
 * const { result, trace } = tracer.run(() =>
 *   pipe(5, double, addOne)
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
  }

  return {
    run<T>(fn: () => T): { result: T; trace: Trace } {
      const state: TracerState = {
        options: resolvedOptions,
        rootSpans: [],
      }

      const traceId = resolvedOptions.generateId()

      const result = runWithContext(
        {
          state,
          currentSpanId: null,
          currentSpan: null,
          depth: 0,
        },
        fn,
      )

      return { result, trace: buildTrace(state, traceId) }
    },

    async runAsync<T>(fn: () => Promise<T>): Promise<{ result: T; trace: Trace }> {
      const state: TracerState = {
        options: resolvedOptions,
        rootSpans: [],
      }

      const traceId = resolvedOptions.generateId()

      const result = await runWithContext(
        {
          state,
          currentSpanId: null,
          currentSpan: null,
          depth: 0,
        },
        fn,
      )

      return { result, trace: buildTrace(state, traceId) }
    },
  }
}
