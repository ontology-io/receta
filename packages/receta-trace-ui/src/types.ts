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
  readonly children: readonly SpanJSON[]
}

/** Mirror of TraceJSON from @ontologyio/receta-trace */
export interface TraceJSON {
  readonly id: string
  readonly rootSpan: SpanJSON
  readonly totalDurationMs: number
  readonly spanCount: number
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
  order: number
  selected?: boolean
  [key: string]: unknown
}
