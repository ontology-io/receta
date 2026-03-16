import { useCallback, useMemo } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  type NodeTypes,
  type Node,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import type { TraceJSON, TraceNodeData } from '../types'
import { traceToNodesAndEdges } from '../lib/convert'
import { layoutNodes } from '../lib/layout'
import { TraceNode } from './TraceNode'

const nodeTypes: NodeTypes = {
  traceNode: TraceNode,
}

interface TraceGraphProps {
  trace: TraceJSON
  onNodeSelect: (data: TraceNodeData | null) => void
}

export function TraceGraph({ trace, onNodeSelect }: TraceGraphProps) {
  const { initialNodes, initialEdges } = useMemo(() => {
    const { nodes: rawNodes, edges } = traceToNodesAndEdges(trace)
    const positioned = layoutNodes(rawNodes, edges)
    return { initialNodes: positioned, initialEdges: edges }
  }, [trace])

  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, , onEdgesChange] = useEdgesState(initialEdges)

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node<TraceNodeData>) => {
      onNodeSelect(node.data)
    },
    [onNodeSelect],
  )

  const onPaneClick = useCallback(() => {
    onNodeSelect(null)
  }, [onNodeSelect])

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={onNodeClick}
      onPaneClick={onPaneClick}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ padding: 0.3 }}
      minZoom={0.1}
      maxZoom={2}
      defaultEdgeOptions={{
        type: 'smoothstep',
        style: { stroke: '#94a3b8', strokeWidth: 1.5 },
      }}
    >
      <Background color="#e2e8f0" gap={20} size={1} />
      <Controls showInteractive={false} />
    </ReactFlow>
  )
}
