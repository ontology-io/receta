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
 * A single execution span in the trace tree.
 *
 * Each span represents one function call within a traced execution,
 * capturing timing, inputs, outputs, and parent-child relationships.
 */
export interface Span {
  readonly id: SpanId
  readonly parentId: SpanId | null
  readonly name: string
  readonly input: unknown
  readonly output: unknown
  readonly startTime: number
  readonly endTime: number
  readonly durationMs: number
  readonly status: 'ok' | 'error'
  readonly error?: unknown
  readonly metadata: Record<string, unknown>
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
}

/**
 * Internal mutable span used during trace collection.
 * Converted to immutable Span when the trace completes.
 */
export interface MutableSpan {
  id: SpanId
  parentId: SpanId | null
  name: string
  input: unknown
  output: unknown
  startTime: number
  endTime: number
  status: 'ok' | 'error'
  error?: unknown
  metadata: Record<string, unknown>
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
