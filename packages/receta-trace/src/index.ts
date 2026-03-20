// Types
export type {
  SpanId,
  FnMeta,
  SpanEvent,
  Span,
  Trace,
  TracerOptions,
  TracedFunction,
  TraceEvent,
} from './types'

// Context
export { getActiveContext } from './context'

// Span runtime APIs
export { emitEvent, setTag, annotate } from './span'

// Traced wrapper (still useful for user-defined functions)
export { traced, isTraced } from './traced'

// Tracer
export type { Tracer } from './tracer'
export { createTracer } from './tracer'

// Native tracing activation
export { activateTracing, deactivateTracing } from './activate'

// Convenience API
export { withTrace, withTraceAsync } from './withTrace'

// Traced pipes (convenience for self-contained traces)
export { tracedPipe } from './tracedPipe'
export { tracedPipeAsync } from './tracedPipeAsync'

// Async-aware tracing
export { tracedRetry, tracedTimeout, tracedMapAsync } from './async'

// Formatters
export type { TreeStringOptions, SpanEventJSON, SpanJSON, TraceJSON } from './format'
export { toTreeString, toJSON } from './format'
