import type { TraceJSON } from '../types'
import { generatedSuccessTrace, generatedErrorTrace, generatedParallelTrace } from '../lib/generated'

interface ToolbarProps {
  onLoadTrace: (trace: TraceJSON) => void
  traceInfo: TraceJSON | null
}

export function Toolbar({ onLoadTrace, traceInfo }: ToolbarProps) {
  const handleFileLoad = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const text = await file.text()
      try {
        const trace = JSON.parse(text) as TraceJSON
        if (!trace.rootSpan || !trace.id) {
          alert('Invalid trace JSON: missing rootSpan or id')
          return
        }
        onLoadTrace(trace)
      } catch {
        alert('Invalid JSON file')
      }
    }
    input.click()
  }

  const handlePaste = () => {
    const json = prompt('Paste your TraceJSON:')
    if (!json) return
    try {
      const trace = JSON.parse(json) as TraceJSON
      if (!trace.rootSpan || !trace.id) {
        alert('Invalid trace JSON: missing rootSpan or id')
        return
      }
      onLoadTrace(trace)
    } catch {
      alert('Invalid JSON')
    }
  }

  return (
    <div style={toolbarStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <h1 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1a1a2e' }}>
          Receta Trace Viewer
        </h1>

        {traceInfo && (
          <div style={infoStyle}>
            {traceInfo.spanCount} spans &middot; {traceInfo.totalDurationMs.toFixed(2)}ms
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => onLoadTrace(generatedSuccessTrace)} style={buttonStyle}>
          Success Example
        </button>
        <button onClick={() => onLoadTrace(generatedParallelTrace)} style={{ ...buttonStyle, color: '#7c3aed', borderColor: '#c4b5fd' }}>
          Parallel Example
        </button>
        <button onClick={() => onLoadTrace(generatedErrorTrace)} style={{ ...buttonStyle, color: '#ef4444', borderColor: '#fca5a5' }}>
          Error Example
        </button>
        <button onClick={handlePaste} style={buttonStyle}>
          Paste JSON
        </button>
        <button onClick={handleFileLoad} style={{ ...buttonStyle, ...primaryButtonStyle }}>
          Load File
        </button>
      </div>
    </div>
  )
}

const toolbarStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '10px 16px',
  borderBottom: '1px solid #e5e7eb',
  background: '#ffffff',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

const infoStyle: React.CSSProperties = {
  fontSize: 12,
  color: '#6b7280',
  fontFamily: 'monospace',
  background: '#f3f4f6',
  padding: '4px 8px',
  borderRadius: 4,
}

const buttonStyle: React.CSSProperties = {
  padding: '6px 14px',
  fontSize: 13,
  fontWeight: 500,
  border: '1px solid #d1d5db',
  borderRadius: 6,
  background: '#ffffff',
  color: '#374151',
  cursor: 'pointer',
}

const primaryButtonStyle: React.CSSProperties = {
  background: '#3b82f6',
  color: '#ffffff',
  borderColor: '#3b82f6',
}
