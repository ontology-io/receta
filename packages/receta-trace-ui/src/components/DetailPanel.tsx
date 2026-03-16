import type { TraceNodeData } from '../types'

interface DetailPanelProps {
  data: TraceNodeData | null
}

function formatJson(value: unknown): string {
  if (value === undefined) return 'undefined'
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

export function DetailPanel({ data }: DetailPanelProps) {
  if (!data) {
    return (
      <div style={containerStyle}>
        <div style={emptyStyle}>
          Click a node to see its details
        </div>
      </div>
    )
  }

  const isError = data.status === 'error'
  const duration = data.durationMs < 1
    ? `${(data.durationMs * 1000).toFixed(0)}µs`
    : `${data.durationMs.toFixed(2)}ms`

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: isError ? '#ef4444' : '#22c55e',
            flexShrink: 0,
          }}
        />
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{data.name}</h2>
      </div>

      <div style={sectionStyle}>
        <div style={labelStyle}>Step</div>
        <div style={valueStyle}>#{data.order}</div>
      </div>

      <div style={sectionStyle}>
        <div style={labelStyle}>Duration</div>
        <div style={valueStyle}>{duration}</div>
      </div>

      <div style={sectionStyle}>
        <div style={labelStyle}>Status</div>
        <div style={{
          ...valueStyle,
          color: isError ? '#ef4444' : '#22c55e',
          fontWeight: 600,
        }}>
          {data.status}
        </div>
      </div>

      {data.tags && Object.keys(data.tags).length > 0 && (
        <div style={sectionStyle}>
          <div style={labelStyle}>Tags</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {Object.entries(data.tags).map(([key, val]) => (
              <span key={key} style={{
                fontSize: 11,
                padding: '2px 8px',
                borderRadius: 12,
                background: '#e0e7ff',
                color: '#3730a3',
                fontFamily: 'monospace',
                whiteSpace: 'nowrap',
              }}>
                {key}={typeof val === 'string' ? val : JSON.stringify(val)}
              </span>
            ))}
          </div>
        </div>
      )}

      {data.input !== undefined && (
        <div style={sectionStyle}>
          <div style={labelStyle}>Input</div>
          <pre style={preStyle}>{formatJson(data.input)}</pre>
        </div>
      )}

      {data.output !== undefined && !isError && (
        <div style={sectionStyle}>
          <div style={labelStyle}>Output</div>
          <pre style={preStyle}>{formatJson(data.output)}</pre>
        </div>
      )}

      {isError && data.error !== undefined && (
        <div style={sectionStyle}>
          <div style={{ ...labelStyle, color: '#ef4444' }}>Error</div>
          <pre style={{ ...preStyle, color: '#ef4444', background: '#fef2f2' }}>
            {formatJson(data.error)}
          </pre>
        </div>
      )}

      {data.events && data.events.length > 0 && (
        <div style={sectionStyle}>
          <div style={labelStyle}>Events ({data.events.length})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {data.events.map((evt, i) => (
              <div key={i} style={{
                background: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: 6,
                padding: '6px 8px',
              }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#92400e', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ color: '#f59e0b' }}>&#9670;</span>
                  {evt.name}
                </div>
                {evt.data && (
                  <pre style={{
                    ...preStyle,
                    background: 'transparent',
                    padding: '4px 0 0 0',
                    maxHeight: 100,
                    fontSize: 11,
                  }}>
                    {formatJson(evt.data)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {Object.keys(data.metadata).length > 0 && (
        <div style={sectionStyle}>
          <div style={labelStyle}>Metadata</div>
          <pre style={preStyle}>{formatJson(data.metadata)}</pre>
        </div>
      )}
    </div>
  )
}

const containerStyle: React.CSSProperties = {
  width: 320,
  borderLeft: '1px solid #e5e7eb',
  background: '#fafafa',
  overflowY: 'auto',
  padding: 16,
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

const emptyStyle: React.CSSProperties = {
  color: '#9ca3af',
  fontSize: 14,
  textAlign: 'center',
  marginTop: 100,
}

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  paddingBottom: 12,
  borderBottom: '1px solid #e5e7eb',
  marginBottom: 12,
}

const sectionStyle: React.CSSProperties = {
  marginBottom: 14,
}

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: 4,
}

const valueStyle: React.CSSProperties = {
  fontSize: 14,
  color: '#1f2937',
  fontFamily: 'monospace',
}

const preStyle: React.CSSProperties = {
  fontSize: 12,
  color: '#374151',
  background: '#f3f4f6',
  padding: '8px 10px',
  borderRadius: 6,
  overflow: 'auto',
  maxHeight: 200,
  margin: 0,
  fontFamily: '"Fira Code", "JetBrains Mono", Menlo, monospace',
  lineHeight: 1.5,
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
}
