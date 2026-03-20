/** Mirror of SpanEventJSON from @ontologyio/receta-trace */
export interface SpanEventJSON {
  readonly name: string
  readonly timestamp: number
  readonly data?: Record<string, unknown>
}

/** Mirror of SpanJSON from @ontologyio/receta-trace */
export interface SpanJSON {
  readonly id: string
  readonly parentId: string | null
  readonly name: string
  readonly input: unknown
  readonly output: unknown
  readonly startTime: number
  readonly endTime: number
  readonly durationMs: number
  readonly status: 'ok' | 'error'
  readonly error?: unknown
  readonly metadata: Record<string, unknown>
  readonly tags: Record<string, unknown>
  readonly events: readonly SpanEventJSON[]
  readonly children: readonly SpanJSON[]
}

/** Mirror of TraceJSON from @ontologyio/receta-trace */
export interface TraceJSON {
  readonly id: string
  readonly rootSpan: SpanJSON
  readonly totalDurationMs: number
  readonly spanCount: number
}

/** Mirror of TraceEvent from @ontologyio/receta-trace */
export type TraceEvent =
  | { type: 'trace-start'; traceId: string; timestamp: number }
  | {
      type: 'span-start'
      traceId: string
      spanId: string
      parentId: string | null
      name: string
      module: string
      input?: unknown
      timestamp: number
      depth: number
    }
  | {
      type: 'span-end'
      traceId: string
      spanId: string
      name: string
      output?: unknown
      durationMs: number
      status: 'ok' | 'error'
      error?: unknown
      timestamp: number
    }
  | {
      type: 'event'
      traceId: string
      spanId: string
      name: string
      data?: Record<string, unknown>
      timestamp: number
    }
  | {
      type: 'trace-end'
      traceId: string
      totalDurationMs: number
      spanCount: number
      timestamp: number
    }

/** Data carried by each React Flow node */
export type TraceNodeData = {
  name: string
  durationMs: number
  status: 'ok' | 'error'
  input: unknown
  output: unknown
  error?: unknown
  metadata: Record<string, unknown>
  tags: Record<string, unknown>
  events: readonly SpanEventJSON[]
  order: number
  selected?: boolean
  [key: string]: unknown
}
