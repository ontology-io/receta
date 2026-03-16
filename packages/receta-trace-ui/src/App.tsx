import { useState } from 'react'
import type { TraceJSON, TraceNodeData } from './types'
import { TraceGraph } from './components/TraceGraph'
import { DetailPanel } from './components/DetailPanel'
import { Toolbar } from './components/Toolbar'
import { sampleTrace } from './lib/sampleData'

export function App() {
  const [trace, setTrace] = useState<TraceJSON>(sampleTrace)
  const [selectedNode, setSelectedNode] = useState<TraceNodeData | null>(null)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Toolbar onLoadTrace={(t) => { setTrace(t); setSelectedNode(null) }} traceInfo={trace} />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{ flex: 1 }}>
          <TraceGraph key={trace.id} trace={trace} onNodeSelect={setSelectedNode} />
        </div>
        <DetailPanel data={selectedNode} />
      </div>
    </div>
  )
}
