import { useState } from 'react'
import type { TraceJSON, TraceNodeData } from './types'
import { TraceGraph } from './components/TraceGraph'
import { TimelineView } from './components/TimelineView'
import { DetailPanel } from './components/DetailPanel'
import { Toolbar } from './components/Toolbar'
import { generatedSuccessTrace } from './lib/generated'

type ViewMode = 'graph' | 'timeline'

export function App() {
  const [trace, setTrace] = useState<TraceJSON>(generatedSuccessTrace)
  const [selectedNode, setSelectedNode] = useState<TraceNodeData | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('graph')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ flex: 1 }}>
          <Toolbar onLoadTrace={(t) => { setTrace(t); setSelectedNode(null) }} traceInfo={trace} />
        </div>
        <div style={{ display: 'flex', gap: 0, marginRight: 16 }}>
          <button
            onClick={() => setViewMode('graph')}
            style={{
              padding: '6px 14px',
              fontSize: 13,
              fontWeight: viewMode === 'graph' ? 600 : 400,
              border: '1px solid #d1d5db',
              borderRadius: '6px 0 0 6px',
              background: viewMode === 'graph' ? '#3b82f6' : '#fff',
              color: viewMode === 'graph' ? '#fff' : '#374151',
              cursor: 'pointer',
            }}
          >
            Graph
          </button>
          <button
            onClick={() => setViewMode('timeline')}
            style={{
              padding: '6px 14px',
              fontSize: 13,
              fontWeight: viewMode === 'timeline' ? 600 : 400,
              border: '1px solid #d1d5db',
              borderLeft: 'none',
              borderRadius: '0 6px 6px 0',
              background: viewMode === 'timeline' ? '#3b82f6' : '#fff',
              color: viewMode === 'timeline' ? '#fff' : '#374151',
              cursor: 'pointer',
            }}
          >
            Timeline
          </button>
        </div>
      </div>
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{ flex: 1 }}>
          {viewMode === 'graph' ? (
            <TraceGraph key={trace.id} trace={trace} onNodeSelect={setSelectedNode} />
          ) : (
            <TimelineView key={trace.id} trace={trace} onSpanSelect={setSelectedNode} />
          )}
        </div>
        <DetailPanel data={selectedNode} />
      </div>
    </div>
  )
}
