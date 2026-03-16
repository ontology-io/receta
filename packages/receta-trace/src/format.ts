import type { Span, SpanEvent, Trace } from './types'

/**
 * Options for tree string formatting.
 */
export interface TreeStringOptions {
  /** Enable ANSI color codes. Default: true */
  readonly color?: boolean
}

// ANSI escape codes
const ansi = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  boldRed: '\x1b[1;31m',
  dimWhite: '\x1b[2;37m',
} as const

function c(code: string, text: string, enabled: boolean): string {
  return enabled ? `${code}${text}${ansi.reset}` : text
}

/**
 * Format a trace as a human-readable tree string.
 *
 * By default uses ANSI colors for terminal output. Pass `{ color: false }`
 * for plain text (logs, files, tests).
 *
 * @example
 * ```typescript
 * console.log(toTreeString(trace))
 * // pipeline (12.34ms)
 * // ├─ fetchUser (8.12ms) → { id: "123" }
 * // ├─ validate (2.05ms) → Ok(...)
 * // └─ transform (1.20ms) ✗ → Error: boom
 * ```
 */
export function toTreeString(trace: Trace, options?: TreeStringOptions): string {
  const useColor = options?.color ?? true
  return formatSpan(trace.rootSpan, '', true, true, useColor)
}

function formatSpan(
  span: Span,
  prefix: string,
  isLast: boolean,
  isRoot: boolean,
  color: boolean,
): string {
  const connector = isRoot ? '' : isLast ? '└─ ' : '├─ '
  const duration = span.durationMs.toFixed(2)
  const isError = span.status === 'error'

  const name = isError
    ? c(ansi.boldRed, span.name, color)
    : c(ansi.bold, span.name, color)

  const timing = c(ansi.dim, `(${duration}ms)`, color)
  const statusMark = isError ? c(ansi.red, ' ✗', color) : ''
  const output = formatOutput(span, color)
  const tagKeys = Object.keys(span.tags)
  const tagsStr = tagKeys.length > 0
    ? ' ' + c(ansi.dim, `[${tagKeys.map((k) => `${k}=${formatValue(span.tags[k])}`).join(', ')}]`, color)
    : ''

  let line = `${prefix}${connector}${name} ${timing}${tagsStr}${statusMark}${output}`

  const childPrefix = isRoot ? '' : prefix + (isLast ? '   ' : '│  ')

  // Render events before children
  for (const event of span.events) {
    const evtName = c(ansi.yellow, `◆ ${event.name}`, color)
    const evtTime = c(ansi.dim, `+${(event.timestamp - span.startTime).toFixed(1)}ms`, color)
    const evtData = event.data
      ? c(ansi.dim, ` ${formatValue(event.data)}`, color)
      : ''
    const hasChildren = span.children.length > 0
    const evtConnector = hasChildren ? '│  ' : '   '
    line += `\n${childPrefix}${evtConnector}${evtName} ${evtTime}${evtData}`
  }

  const children = span.children
  for (let i = 0; i < children.length; i++) {
    const child = children[i]!
    const isChildLast = i === children.length - 1
    line += '\n' + formatSpan(child, childPrefix, isChildLast, false, color)
  }

  return line
}

function formatOutput(span: Span, color: boolean): string {
  if (span.status === 'error' && span.error !== undefined) {
    const arrow = c(ansi.red, ' → ', color)
    const errText = c(ansi.red, `Error: ${formatValue(span.error)}`, color)
    return `${arrow}${errText}`
  }
  if (span.output !== undefined) {
    const arrow = c(ansi.dim, ' → ', color)
    const val = c(ansi.cyan, formatValue(span.output), color)
    return `${arrow}${val}`
  }
  return ''
}

function formatValue(value: unknown): string {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  if (typeof value === 'string') {
    return value.length > 50 ? `"${value.slice(0, 47)}..."` : `"${value}"`
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  if (value instanceof Error) {
    return value.message
  }
  try {
    const json = JSON.stringify(value)
    return json.length > 80 ? json.slice(0, 77) + '...' : json
  } catch {
    return String(value)
  }
}

/**
 * Serializable JSON representation of a span.
 */
export interface SpanEventJSON {
  readonly name: string
  readonly timestamp: number
  readonly data?: Record<string, unknown>
}

export interface SpanJSON {
  readonly id: string
  readonly parentId: string | null
  readonly name: string
  readonly input: unknown
  readonly output: unknown
  readonly startTime: number
  readonly endTime: number
  readonly durationMs: number
  readonly status: 'ok' | 'error'
  readonly error?: unknown
  readonly metadata: Record<string, unknown>
  readonly tags: Record<string, unknown>
  readonly events: readonly SpanEventJSON[]
  readonly children: readonly SpanJSON[]
}

/**
 * Serializable JSON representation of a trace.
 */
export interface TraceJSON {
  readonly id: string
  readonly rootSpan: SpanJSON
  readonly totalDurationMs: number
  readonly spanCount: number
}

/**
 * Convert a trace to a serializable JSON object.
 *
 * @example
 * ```typescript
 * const json = toJSON(trace)
 * console.log(JSON.stringify(json, null, 2))
 * // or send to a logging service
 * logger.info('trace', json)
 * ```
 */
export function toJSON(trace: Trace): TraceJSON {
  return {
    id: trace.id,
    rootSpan: spanToJSON(trace.rootSpan),
    totalDurationMs: trace.totalDurationMs,
    spanCount: trace.spans.length,
  }
}

function spanToJSON(span: Span): SpanJSON {
  return {
    id: span.id,
    parentId: span.parentId,
    name: span.name,
    input: span.input,
    output: span.output,
    startTime: span.startTime,
    endTime: span.endTime,
    durationMs: span.durationMs,
    status: span.status,
    ...(span.error !== undefined ? { error: span.error } : {}),
    metadata: span.metadata,
    tags: span.tags,
    events: span.events.map((e) => ({
      name: e.name,
      timestamp: e.timestamp,
      ...(e.data !== undefined ? { data: e.data } : {}),
    })),
    children: span.children.map(spanToJSON),
  }
}
