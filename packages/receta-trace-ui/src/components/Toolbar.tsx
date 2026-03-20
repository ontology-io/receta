import type { TraceJSON } from '../types'
import { generatedSuccessTrace, generatedErrorTrace, generatedParallelTrace } from '../lib/generated'

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected'

interface ToolbarProps {
  onLoadTrace: (trace: TraceJSON) => void
  traceInfo: TraceJSON | null
  connectionStatus: ConnectionStatus
  onConnect: (url: string) => void
  onDisconnect: () => void
}

export function Toolbar({ onLoadTrace, traceInfo, connectionStatus, onConnect, onDisconnect }: ToolbarProps) {
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

  const handleConnect = () => {
    if (connectionStatus === 'connected' || connectionStatus === 'connecting') {
      onDisconnect()
    } else {
      const url = prompt('WebSocket URL:', 'ws://localhost:3000/ws/trace')
      if (url) onConnect(url)
    }
  }

  const statusColor =
    connectionStatus === 'connected'
      ? '#22c55e'
      : connectionStatus === 'connecting'
        ? '#f59e0b'
        : '#9ca3af'

  const statusLabel =
    connectionStatus === 'connected'
      ? 'Live'
      : connectionStatus === 'connecting'
        ? 'Connecting...'
        : ''

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

        {statusLabel && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: statusColor,
                boxShadow: connectionStatus === 'connected' ? `0 0 6px ${statusColor}` : 'none',
              }}
            />
            <span style={{ color: statusColor, fontWeight: 600 }}>{statusLabel}</span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={handleConnect}
          style={{
            ...buttonStyle,
            ...(connectionStatus === 'connected'
              ? { background: '#ef4444', color: '#fff', borderColor: '#ef4444' }
              : { background: '#22c55e', color: '#fff', borderColor: '#22c55e' }),
          }}
        >
          {connectionStatus === 'connected' || connectionStatus === 'connecting'
            ? 'Disconnect'
            : 'Connect'}
        </button>
        <div style={{ width: 1, background: '#e5e7eb' }} />
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
