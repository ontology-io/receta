/**
 * Unique identifier for a span.
 */
export type SpanId = string & { readonly __brand: 'SpanId' }

/**
 * Metadata that can be attached to a traced function.
 */
export interface FnMeta {
  readonly name: string
  readonly module?: string
  readonly category?: string
  readonly [key: string]: unknown
}

/**
 * A timestamped event emitted during span execution.
 * Use emitEvent() inside a traced function to record events
 * like retry attempts, cache hits, or decision points.
 */
export interface SpanEvent {
  readonly name: string
  readonly timestamp: number
  readonly data?: Record<string, unknown>
}

/**
 * A single execution span in the trace tree.
 *
 * Each span represents one function call within a traced execution,
 * capturing timing, inputs, outputs, and parent-child relationships.
 */
export interface Span {
  readonly id: SpanId
  readonly parentId: SpanId | null
  readonly name: string
  readonly module: string
  readonly input: unknown
  readonly output: unknown
  readonly startTime: number
  readonly endTime: number
  readonly durationMs: number
  readonly status: 'ok' | 'error'
  readonly error?: unknown
  readonly metadata: Record<string, unknown>
  readonly tags: Record<string, unknown>
  readonly events: readonly SpanEvent[]
  readonly children: readonly Span[]
}

/**
 * The complete trace produced by a traced execution.
 *
 * Contains both a tree structure (rootSpan with children) and
 * a flat list of all spans for easy iteration.
 */
export interface Trace {
  readonly id: string
  readonly rootSpan: Span
  readonly spans: readonly Span[]
  readonly totalDurationMs: number
}

/**
 * A real-time trace event emitted as functions execute.
 * Subscribe via `onEvent` in TracerOptions to receive these as JSON.
 */
export type TraceEvent =
  | {
      readonly type: 'trace-start'
      readonly traceId: string
      readonly timestamp: number
    }
  | {
      readonly type: 'span-start'
      readonly traceId: string
      readonly spanId: string
      readonly parentId: string | null
      readonly name: string
      readonly module: string
      readonly input?: unknown
      readonly timestamp: number
      readonly depth: number
    }
  | {
      readonly type: 'span-end'
      readonly traceId: string
      readonly spanId: string
      readonly name: string
      readonly output?: unknown
      readonly durationMs: number
      readonly status: 'ok' | 'error'
      readonly error?: unknown
      readonly timestamp: number
    }
  | {
      readonly type: 'event'
      readonly traceId: string
      readonly spanId: string
      readonly name: string
      readonly data?: Record<string, unknown>
      readonly timestamp: number
    }
  | {
      readonly type: 'trace-end'
      readonly traceId: string
      readonly totalDurationMs: number
      readonly spanCount: number
      readonly timestamp: number
    }

/**
 * Configuration options for creating a tracer.
 */
export interface TracerOptions {
  /** Whether to capture input values. Default: true */
  readonly captureInputs?: boolean
  /** Whether to capture output values. Default: true */
  readonly captureOutputs?: boolean
  /** Maximum depth of nested spans. Default: Infinity */
  readonly maxDepth?: number
  /** Custom clock function for testing. Default: performance.now */
  readonly clock?: () => number
  /** Custom ID generator. Default: crypto.randomUUID */
  readonly generateId?: () => string
  /** Called when each span completes */
  readonly onSpan?: (span: Span) => void
  /** Called in real-time as trace events occur (span start/end, trace start/end) */
  readonly onEvent?: (event: TraceEvent) => void
}

/**
 * Internal mutable span used during trace collection.
 * Converted to immutable Span when the trace completes.
 */
export interface MutableSpan {
  id: SpanId
  parentId: SpanId | null
  name: string
  module: string
  input: unknown
  output: unknown
  startTime: number
  endTime: number
  status: 'ok' | 'error'
  error?: unknown
  metadata: Record<string, unknown>
  tags: Record<string, unknown>
  events: SpanEvent[]
  children: MutableSpan[]
}

/**
 * A function that has been wrapped with traced().
 * Carries metadata for span creation.
 */
export interface TracedFunction<F extends (...args: readonly any[]) => any> {
  (...args: Parameters<F>): ReturnType<F>
  readonly __trace_meta: FnMeta
}
