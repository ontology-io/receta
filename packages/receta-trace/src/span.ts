import type { SpanId, MutableSpan, Span, SpanEvent, Trace } from './types'
import type { TraceContext, TracerState } from './context'
import { getActiveContext, runWithContext } from './context'

/**
 * Create a new mutable span and attach it to the current context.
 * Emits a real-time 'span-start' event if onEvent is configured.
 */
export function createSpan(
  state: TracerState,
  name: string,
  input: unknown,
  parentSpan: MutableSpan | null,
  module: string = '',
  depth: number = 0,
): MutableSpan {
  const span: MutableSpan = {
    id: state.options.generateId() as SpanId,
    parentId: parentSpan?.id ?? null,
    name,
    module,
    input: state.options.captureInputs ? input : undefined,
    output: undefined,
    startTime: state.options.clock(),
    endTime: 0,
    status: 'ok',
    metadata: {},
    tags: {},
    events: [],
    children: [],
  }

  if (parentSpan) {
    parentSpan.children.push(span)
  } else {
    state.rootSpans.push(span)
  }

  // Emit real-time span-start event
  state.options.onEvent?.({
    type: 'span-start',
    traceId: state.traceId,
    spanId: span.id,
    parentId: span.parentId,
    name,
    module,
    input: state.options.captureInputs ? input : undefined,
    timestamp: span.startTime,
    depth,
  })

  return span
}

/**
 * Check if a value is a Result with _tag: 'Err'.
 */
function isResultErr(value: unknown): boolean {
  return (
    typeof value === 'object' &&
    value !== null &&
    '_tag' in value &&
    (value as { _tag: string })._tag === 'Err'
  )
}

/**
 * Finalize a span with its output or error.
 * Automatically detects Result Err values and marks span as error.
 */
export function finalizeSpan(
  state: TracerState,
  span: MutableSpan,
  output: unknown,
  error?: unknown,
): void {
  span.endTime = state.options.clock()
  if (error !== undefined) {
    span.status = 'error'
    span.error = error
  } else {
    span.output = state.options.captureOutputs ? output : undefined
    // Result-awareness: detect Err(_tag) and mark as error
    if (isResultErr(output)) {
      span.status = 'error'
      span.error = (output as { error: unknown }).error
    }
  }
  state.options.onSpan?.(freezeSpan(span))

  // Emit real-time span-end event
  state.options.onEvent?.({
    type: 'span-end',
    traceId: state.traceId,
    spanId: span.id,
    name: span.name,
    output: state.options.captureOutputs ? output : undefined,
    durationMs: span.endTime - span.startTime,
    status: span.status,
    ...(span.error !== undefined ? { error: span.error } : {}),
    timestamp: span.endTime,
  })
}

/**
 * Emit a timestamped event on the current span.
 * Call this inside a traced function to record events like retry attempts,
 * cache hits, or decision points.
 *
 * No-op when no tracer is active.
 *
 * @example
 * ```typescript
 * const fetchData = traced('fetchData', async (url: string) => {
 *   emitEvent('cache-check', { url })
 *   const cached = cache.get(url)
 *   if (cached) {
 *     emitEvent('cache-hit')
 *     return cached
 *   }
 *   emitEvent('cache-miss')
 *   return await fetch(url)
 * })
 * ```
 */
export function emitEvent(name: string, data?: Record<string, unknown>): void {
  const ctx = getActiveContext()
  if (ctx === undefined || ctx.currentSpan === null) return

  const timestamp = ctx.state.options.clock()

  ctx.currentSpan.events.push({
    name,
    timestamp,
    ...(data !== undefined ? { data } : {}),
  })

  // Emit real-time event
  ctx.state.options.onEvent?.({
    type: 'event',
    traceId: ctx.state.traceId,
    spanId: ctx.currentSpan.id,
    name,
    ...(data !== undefined ? { data } : {}),
    timestamp,
  })
}

/**
 * Set a tag on the current span.
 * Tags are searchable key-value attributes set at runtime.
 *
 * No-op when no tracer is active.
 *
 * @example
 * ```typescript
 * const processOrder = traced('processOrder', (order) => {
 *   setTag('orderId', order.id)
 *   setTag('userId', order.userId)
 *   // ...
 * })
 * ```
 */
export function setTag(key: string, value: unknown): void {
  const ctx = getActiveContext()
  if (ctx === undefined || ctx.currentSpan === null) return
  ctx.currentSpan.tags[key] = value
}

/**
 * Attach an annotation to the current span.
 * Annotations are dynamic key-value data discovered during execution.
 *
 * This is an alias for `setTag` — both write to the same `tags` field.
 * Use `annotate` when the intent is enriching context (e.g. transactionId),
 * and `setTag` when the intent is filtering/search (e.g. userId).
 *
 * No-op when no tracer is active.
 *
 * @example
 * ```typescript
 * const processPayment = traced('processPayment', async (order) => {
 *   annotate('provider', selectProvider(order).name)
 *   const result = await charge(order)
 *   annotate('transactionId', result.txnId)
 *   return result
 * })
 * ```
 */
export function annotate(key: string, value: unknown): void {
  setTag(key, value)
}

/**
 * Record a function call as a span.
 * Handles both sync and async functions transparently.
 * If the function returns a Promise, the span is finalized when it settles.
 */
export function recordSpan<T>(
  ctx: TraceContext,
  name: string,
  fn: (...args: readonly any[]) => T,
  args: readonly any[],
  module: string = '',
): T {
  const input = args.length === 1 ? args[0] : args
  const span = createSpan(ctx.state, name, input, ctx.currentSpan, module, ctx.depth)

  const childCtx: TraceContext = {
    state: ctx.state,
    currentSpanId: span.id,
    currentSpan: span,
    depth: ctx.depth + 1,
  }

  try {
    const result = runWithContext(childCtx, () => fn(...args))

    // Handle async: if result is a Promise, finalize when it settles
    if (result instanceof Promise) {
      return result.then(
        (value) => {
          finalizeSpan(ctx.state, span, value)
          return value
        },
        (error) => {
          finalizeSpan(ctx.state, span, undefined, error)
          throw error
        },
      ) as T
    }

    finalizeSpan(ctx.state, span, result)
    return result
  } catch (error) {
    finalizeSpan(ctx.state, span, undefined, error)
    throw error
  }
}

/**
 * Convert a mutable span to an immutable Span.
 */
export function freezeSpan(mutable: MutableSpan): Span {
  return {
    id: mutable.id,
    parentId: mutable.parentId,
    name: mutable.name,
    module: mutable.module,
    input: mutable.input,
    output: mutable.output,
    startTime: mutable.startTime,
    endTime: mutable.endTime,
    durationMs: mutable.endTime - mutable.startTime,
    status: mutable.status,
    ...(mutable.error !== undefined ? { error: mutable.error } : {}),
    metadata: { ...mutable.metadata },
    tags: { ...mutable.tags },
    events: [...mutable.events],
    children: mutable.children.map(freezeSpan),
  }
}

/**
 * Collect all spans from a tree into a flat array.
 */
export function flattenSpans(span: Span): readonly Span[] {
  const result: Span[] = [span]
  for (const child of span.children) {
    result.push(...flattenSpans(child))
  }
  return result
}

/**
 * Build a Trace from collected root spans.
 */
export function buildTrace(
  state: TracerState,
  traceId: string,
): Trace {
  const rootSpans = state.rootSpans.map(freezeSpan)

  // If there's a single root span, use it directly.
  // If there are multiple roots, wrap them in a synthetic root.
  const rootSpan: Span =
    rootSpans.length === 1
      ? rootSpans[0]!
      : {
          id: state.options.generateId() as SpanId,
          parentId: null,
          name: 'trace',
          module: '',
          input: undefined,
          output: undefined,
          startTime: Math.min(...rootSpans.map((s) => s.startTime)),
          endTime: Math.max(...rootSpans.map((s) => s.endTime)),
          durationMs: 0,
          status: rootSpans.some((s) => s.status === 'error') ? 'error' : 'ok',
          metadata: {},
          tags: {},
          events: [],
          children: rootSpans,
        }

  const spans = flattenSpans(rootSpan)

  return {
    id: traceId,
    rootSpan: {
      ...rootSpan,
      durationMs: rootSpan.endTime - rootSpan.startTime,
    },
    spans,
    totalDurationMs: rootSpan.endTime - rootSpan.startTime,
  }
}
