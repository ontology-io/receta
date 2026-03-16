import { AsyncLocalStorage } from 'node:async_hooks'
import type { SpanId, Span, MutableSpan, TracerOptions } from './types'

/**
 * Internal state managed by a tracer during execution.
 */
export interface ResolvedTracerOptions {
  readonly captureInputs: boolean
  readonly captureOutputs: boolean
  readonly maxDepth: number
  readonly clock: () => number
  readonly generateId: () => string
  readonly onSpan: ((span: Span) => void) | undefined
}

export interface TracerState {
  readonly options: ResolvedTracerOptions
  readonly rootSpans: MutableSpan[]
}

/**
 * The trace context propagated through AsyncLocalStorage.
 */
export interface TraceContext {
  readonly state: TracerState
  readonly currentSpanId: SpanId | null
  readonly currentSpan: MutableSpan | null
  readonly depth: number
}

const storage = new AsyncLocalStorage<TraceContext>()

/**
 * Get the currently active trace context, if any.
 * Returns undefined when no tracer is active (zero-overhead fast path).
 */
export function getActiveContext(): TraceContext | undefined {
  return storage.getStore()
}

/**
 * Run a function within a trace context.
 */
export function runWithContext<T>(ctx: TraceContext, fn: () => T): T {
  return storage.run(ctx, fn)
}
