import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import type { TraceNodeData } from '../types'

type TraceNodeType = Node<TraceNodeData, 'traceNode'>

export function TraceNode({ data, selected }: NodeProps<TraceNodeType>) {
  const isError = data.status === 'error'
  const duration = data.durationMs < 1
    ? `${(data.durationMs * 1000).toFixed(0)}µs`
    : data.durationMs < 1000
      ? `${data.durationMs.toFixed(2)}ms`
      : `${(data.durationMs / 1000).toFixed(2)}s`

  return (
    <div
      style={{
        padding: '10px 14px',
        borderRadius: 8,
        border: `2px solid ${selected ? '#4f8ff7' : isError ? '#ef4444' : '#22c55e'}`,
        background: isError ? '#fef2f2' : selected ? '#eff6ff' : '#ffffff',
        boxShadow: selected
          ? '0 0 0 2px rgba(79, 143, 247, 0.3)'
          : '0 1px 3px rgba(0,0,0,0.1)',
        minWidth: 150,
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        position: 'relative',
      }}
    >
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />

      {/* Step number badge */}
      <div
        style={{
          position: 'absolute',
          top: -8,
          left: -8,
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: isError ? '#ef4444' : '#3b82f6',
          color: '#fff',
          fontSize: 10,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid #fff',
          boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
        }}
      >
        {data.order}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: isError ? '#ef4444' : '#22c55e',
            flexShrink: 0,
          }}
        />
        <div
          style={{
            fontWeight: 600,
            fontSize: 13,
            color: '#1a1a2e',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {data.name}
        </div>
      </div>

      <div
        style={{
          fontSize: 11,
          color: '#6b7280',
          marginTop: 4,
          fontFamily: 'monospace',
        }}
      >
        {duration}
      </div>

      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
    </div>
  )
}
