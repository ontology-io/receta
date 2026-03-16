import type { Node, Edge } from '@xyflow/react'
import type { SpanJSON, TraceJSON, TraceNodeData } from '../types'

/**
 * Convert a TraceJSON into React Flow nodes and edges.
 * Recursively walks the span tree, assigning execution order
 * based on startTime so the user knows which function ran first.
 */
export function traceToNodesAndEdges(trace: TraceJSON): {
  nodes: Node<TraceNodeData>[]
  edges: Edge[]
} {
  const nodes: Node<TraceNodeData>[] = []
  const edges: Edge[] = []

  function walk(span: SpanJSON, parentId: string | null) {
    // Order is assigned later after collecting all spans
    nodes.push({
      id: span.id,
      type: 'traceNode',
      position: { x: 0, y: 0 },
      data: {
        name: span.name,
        durationMs: span.durationMs,
        status: span.status,
        input: span.input,
        output: span.output,
        error: span.error,
        metadata: span.metadata,
        order: 0, // placeholder
        startTime: span.startTime, // used for sorting
      },
    })

    if (parentId) {
      edges.push({
        id: `${parentId}-${span.id}`,
        source: parentId,
        target: span.id,
        type: 'smoothstep',
      })
    }

    for (const child of span.children) {
      walk(child, span.id)
    }
  }

  walk(trace.rootSpan, null)

  // Assign execution order based on startTime
  const sorted = [...nodes].sort(
    (a, b) => (a.data.startTime as number) - (b.data.startTime as number),
  )
  sorted.forEach((node, i) => {
    node.data.order = i + 1
  })

  return { nodes, edges }
}
