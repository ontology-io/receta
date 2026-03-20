import { useState, useRef, useCallback } from 'react'
import type { TraceJSON, SpanJSON, SpanEventJSON, TraceEvent } from '../types'

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected'

interface MutableSpan {
  id: string
  parentId: string | null
  name: string
  module: string
  input: unknown
  output: unknown
  startTime: number
  endTime: number
  durationMs: number
  status: 'ok' | 'error'
  error?: unknown
  metadata: Record<string, unknown>
  tags: Record<string, unknown>
  events: SpanEventJSON[]
  children: MutableSpan[]
}

/**
 * React hook for streaming trace events from a WebSocket server.
 *
 * Accumulates TraceEvent messages into a complete TraceJSON object,
 * then pushes the assembled trace via the onTrace callback.
 */
export function useTraceStream(onTrace: (trace: TraceJSON) => void) {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected')
  const wsRef = useRef<WebSocket | null>(null)

  // In-flight trace state
  const traceIdRef = useRef<string>('')
  const spansRef = useRef<Map<string, MutableSpan>>(new Map())
  const rootSpansRef = useRef<MutableSpan[]>([])

  const resetTraceState = useCallback(() => {
    traceIdRef.current = ''
    spansRef.current = new Map()
    rootSpansRef.current = []
  }, [])

  const handleMessage = useCallback(
    (data: string) => {
      let event: TraceEvent
      try {
        event = JSON.parse(data) as TraceEvent
      } catch {
        return
      }

      switch (event.type) {
        case 'trace-start': {
          resetTraceState()
          traceIdRef.current = event.traceId
          break
        }

        case 'span-start': {
          const span: MutableSpan = {
            id: event.spanId,
            parentId: event.parentId,
            name: event.name,
            module: event.module,
            input: event.input,
            output: undefined,
            startTime: event.timestamp,
            endTime: 0,
            durationMs: 0,
            status: 'ok',
            metadata: {},
            tags: {},
            events: [],
            children: [],
          }
          spansRef.current.set(span.id, span)

          if (event.parentId) {
            const parent = spansRef.current.get(event.parentId)
            if (parent) {
              parent.children.push(span)
            }
          } else {
            rootSpansRef.current.push(span)
          }
          break
        }

        case 'span-end': {
          const span = spansRef.current.get(event.spanId)
          if (span) {
            span.output = event.output
            span.endTime = event.timestamp
            span.durationMs = event.durationMs
            span.status = event.status
            if (event.error !== undefined) {
              span.error = event.error
            }
          }
          break
        }

        case 'event': {
          const span = spansRef.current.get(event.spanId)
          if (span) {
            span.events.push({
              name: event.name,
              timestamp: event.timestamp,
              ...(event.data !== undefined ? { data: event.data } : {}),
            })
          }
          break
        }

        case 'trace-end': {
          // Build the final TraceJSON from accumulated spans
          const rootSpans = rootSpansRef.current.map(freezeSpan)

          const rootSpan: SpanJSON =
            rootSpans.length === 1
              ? rootSpans[0]!
              : {
                  id: 'synthetic-root',
                  parentId: null,
                  name: 'trace',
                  input: undefined,
                  output: undefined,
                  startTime: Math.min(...rootSpans.map((s) => s.startTime)),
                  endTime: Math.max(...rootSpans.map((s) => s.endTime)),
                  durationMs: event.totalDurationMs,
                  status: rootSpans.some((s) => s.status === 'error') ? 'error' : 'ok',
                  metadata: {},
                  tags: {},
                  events: [],
                  children: rootSpans,
                }

          const trace: TraceJSON = {
            id: traceIdRef.current,
            rootSpan,
            totalDurationMs: event.totalDurationMs,
            spanCount: event.spanCount,
          }

          onTrace(trace)
          resetTraceState()
          break
        }
      }
    },
    [onTrace, resetTraceState],
  )

  const connect = useCallback(
    (url: string) => {
      if (wsRef.current) {
        wsRef.current.close()
      }

      setStatus('connecting')
      const ws = new WebSocket(url)

      ws.onopen = () => {
        setStatus('connected')
      }

      ws.onmessage = (e) => {
        handleMessage(e.data as string)
      }

      ws.onclose = () => {
        setStatus('disconnected')
        wsRef.current = null
      }

      ws.onerror = () => {
        setStatus('disconnected')
        wsRef.current = null
      }

      wsRef.current = ws
    },
    [handleMessage],
  )

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    setStatus('disconnected')
  }, [])

  return { status, connect, disconnect }
}

function freezeSpan(mutable: MutableSpan): SpanJSON {
  return {
    id: mutable.id,
    parentId: mutable.parentId,
    name: mutable.name,
    input: mutable.input,
    output: mutable.output,
    startTime: mutable.startTime,
    endTime: mutable.endTime,
    durationMs: mutable.durationMs,
    status: mutable.status,
    ...(mutable.error !== undefined ? { error: mutable.error } : {}),
    metadata: mutable.metadata,
    tags: mutable.tags,
    events: [...mutable.events],
    children: mutable.children.map(freezeSpan),
  }
}
