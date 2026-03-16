import Dagre from '@dagrejs/dagre'
import type { Node, Edge } from '@xyflow/react'
import type { TraceNodeData } from '../types'

const NODE_WIDTH = 180
const NODE_HEIGHT = 60

/**
 * Apply Dagre layout to position nodes in a top-down tree.
 */
export function layoutNodes(
  nodes: Node<TraceNodeData>[],
  edges: Edge[],
): Node<TraceNodeData>[] {
  const g = new Dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({
    rankdir: 'LR',
    nodesep: 30,
    ranksep: 60,
    marginx: 20,
    marginy: 20,
  })

  for (const node of nodes) {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT })
  }

  for (const edge of edges) {
    g.setEdge(edge.source, edge.target)
  }

  Dagre.layout(g)

  return nodes.map((node) => {
    const pos = g.node(node.id)
    return {
      ...node,
      position: {
        x: pos.x - NODE_WIDTH / 2,
        y: pos.y - NODE_HEIGHT / 2,
      },
    }
  })
}
