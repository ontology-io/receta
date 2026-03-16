import { useMemo, useState } from 'react'
import type { TraceJSON, SpanJSON, TraceNodeData } from '../types'

interface TimelineViewProps {
  trace: TraceJSON
  onSpanSelect: (data: TraceNodeData | null) => void
}

interface FlatSpan {
  span: SpanJSON
  depth: number
  order: number
}

function flattenSpans(span: SpanJSON, depth: number, list: FlatSpan[]): void {
  list.push({ span, depth, order: list.length + 1 })
  for (const child of span.children) {
    flattenSpans(child, depth + 1, list)
  }
}

export function TimelineView({ trace, onSpanSelect }: TimelineViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const { spans, minTime, maxTime, totalMs } = useMemo(() => {
    const list: FlatSpan[] = []
    flattenSpans(trace.rootSpan, 0, list)
    // Sort by startTime for timeline order
    list.sort((a, b) => a.span.startTime - b.span.startTime)
    // Re-assign order after sort
    list.forEach((item, i) => { item.order = i + 1 })

    const min = Math.min(...list.map((s) => s.span.startTime))
    const max = Math.max(...list.map((s) => s.span.endTime))
    return { spans: list, minTime: min, maxTime: max, totalMs: max - min }
  }, [trace])

  const handleClick = (item: FlatSpan) => {
    setSelectedId(item.span.id)
    onSpanSelect({
      name: item.span.name,
      durationMs: item.span.durationMs,
      status: item.span.status,
      input: item.span.input,
      output: item.span.output,
      error: item.span.error,
      metadata: item.span.metadata,
      tags: item.span.tags ?? {},
      events: item.span.events ?? [],
      order: item.order,
    })
  }

  const ROW_HEIGHT = 32
  const LABEL_WIDTH = 200
  const BAR_AREA_WIDTH = 600

  return (
    <div style={{ overflow: 'auto', height: '100%', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Time axis header */}
      <div style={{ display: 'flex', position: 'sticky', top: 0, background: '#fff', zIndex: 1, borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ width: LABEL_WIDTH, flexShrink: 0, padding: '6px 8px', fontSize: 11, fontWeight: 600, color: '#6b7280' }}>
          Function
        </div>
        <div style={{ flex: 1, minWidth: BAR_AREA_WIDTH, position: 'relative', height: 28 }}>
          {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
            <div key={pct} style={{
              position: 'absolute',
              left: `${pct * 100}%`,
              top: 0,
              bottom: 0,
              borderLeft: '1px solid #e5e7eb',
              fontSize: 10,
              color: '#9ca3af',
              paddingLeft: 3,
              paddingTop: 4,
            }}>
              {(totalMs * pct).toFixed(1)}ms
            </div>
          ))}
        </div>
      </div>

      {/* Span rows */}
      {spans.map((item) => {
        const leftPct = totalMs > 0 ? ((item.span.startTime - minTime) / totalMs) * 100 : 0
        const widthPct = totalMs > 0 ? Math.max((item.span.durationMs / totalMs) * 100, 0.5) : 100
        const isError = item.span.status === 'error'
        const isSelected = item.span.id === selectedId

        return (
          <div
            key={item.span.id}
            onClick={() => handleClick(item)}
            style={{
              display: 'flex',
              height: ROW_HEIGHT,
              alignItems: 'center',
              cursor: 'pointer',
              background: isSelected ? '#eff6ff' : item.order % 2 === 0 ? '#fafafa' : '#fff',
              borderBottom: '1px solid #f3f4f6',
              transition: 'background 0.1s',
            }}
          >
            {/* Label */}
            <div style={{
              width: LABEL_WIDTH,
              flexShrink: 0,
              padding: '0 8px',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}>
              <span style={{
                fontSize: 10,
                fontWeight: 700,
                color: '#fff',
                background: isError ? '#ef4444' : '#3b82f6',
                borderRadius: '50%',
                width: 18,
                height: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                {item.order}
              </span>
              <span style={{
                paddingLeft: item.depth * 10,
                fontSize: 12,
                fontWeight: isSelected ? 600 : 400,
                color: isError ? '#ef4444' : '#1f2937',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {item.span.name}
              </span>
            </div>

            {/* Bar */}
            <div style={{ flex: 1, minWidth: BAR_AREA_WIDTH, position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}>
              {/* Grid lines */}
              {[0.25, 0.5, 0.75].map((pct) => (
                <div key={pct} style={{
                  position: 'absolute',
                  left: `${pct * 100}%`,
                  top: 0,
                  bottom: 0,
                  borderLeft: '1px solid #f3f4f6',
                }} />
              ))}

              {/* Duration bar */}
              <div style={{
                position: 'absolute',
                left: `${leftPct}%`,
                width: `${widthPct}%`,
                height: 18,
                borderRadius: 3,
                background: isError
                  ? 'linear-gradient(90deg, #fca5a5, #ef4444)'
                  : isSelected
                    ? 'linear-gradient(90deg, #93c5fd, #3b82f6)'
                    : 'linear-gradient(90deg, #86efac, #22c55e)',
                boxShadow: isSelected ? '0 0 0 2px rgba(59,130,246,0.3)' : 'none',
                transition: 'box-shadow 0.1s',
              }} />

              {/* Duration label */}
              <span style={{
                position: 'absolute',
                left: `calc(${leftPct + widthPct}% + 6px)`,
                fontSize: 10,
                color: '#6b7280',
                fontFamily: 'monospace',
                whiteSpace: 'nowrap',
              }}>
                {item.span.durationMs < 1
                  ? `${(item.span.durationMs * 1000).toFixed(0)}µs`
                  : `${item.span.durationMs.toFixed(2)}ms`}
              </span>

              {/* Event markers */}
              {(item.span.events ?? []).map((evt, ei) => {
                const evtPct = totalMs > 0 ? ((evt.timestamp - minTime) / totalMs) * 100 : 0
                return (
                  <div
                    key={ei}
                    title={`${evt.name}${evt.data ? ': ' + JSON.stringify(evt.data) : ''}`}
                    style={{
                      position: 'absolute',
                      left: `${evtPct}%`,
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: '#f59e0b',
                      border: '1px solid #d97706',
                      transform: 'translate(-50%, 0)',
                      top: 3,
                      zIndex: 2,
                    }}
                  />
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
