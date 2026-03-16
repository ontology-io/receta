import type { SpanId, MutableSpan, Span, Trace } from './types'
import type { TraceContext, TracerState } from './context'
import { getActiveContext, runWithContext } from './context'

/**
 * Create a new mutable span and attach it to the current context.
 */
export function createSpan(
  state: TracerState,
  name: string,
  input: unknown,
  parentSpan: MutableSpan | null,
): MutableSpan {
  const span: MutableSpan = {
    id: state.options.generateId() as SpanId,
    parentId: parentSpan?.id ?? null,
    name,
    input: state.options.captureInputs ? input : undefined,
    output: undefined,
    startTime: state.options.clock(),
    endTime: 0,
    status: 'ok',
    metadata: {},
    children: [],
  }

  if (parentSpan) {
    parentSpan.children.push(span)
  } else {
    state.rootSpans.push(span)
  }

  return span
}

/**
 * Finalize a span with its output or error.
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
  }
  state.options.onSpan?.(freezeSpan(span))
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
): T {
  const input = args.length === 1 ? args[0] : args
  const span = createSpan(ctx.state, name, input, ctx.currentSpan)

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
    input: mutable.input,
    output: mutable.output,
    startTime: mutable.startTime,
    endTime: mutable.endTime,
    durationMs: mutable.endTime - mutable.startTime,
    status: mutable.status,
    ...(mutable.error !== undefined ? { error: mutable.error } : {}),
    metadata: { ...mutable.metadata },
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
          input: undefined,
          output: undefined,
          startTime: Math.min(...rootSpans.map((s) => s.startTime)),
          endTime: Math.max(...rootSpans.map((s) => s.endTime)),
          durationMs: 0,
          status: rootSpans.some((s) => s.status === 'error') ? 'error' : 'ok',
          metadata: {},
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
