import { describe, it, expect } from 'vitest'
import { toTreeString, toJSON } from '../format'
import { tracedPipe } from '../tracedPipe'
import { traced } from '../traced'
import { createTracer } from '../tracer'

// Use { color: false } in tests for deterministic string matching
const plain = { color: false } as const

describe('toTreeString', () => {
  it('formats a single-span trace', () => {
    const fn = traced('double', (x: number) => x * 2)
    const tracer = createTracer()
    const { trace } = tracer.run(() => fn(5))

    const tree = toTreeString(trace, plain)

    expect(tree).toContain('double')
    expect(tree).toContain('ms)')
    expect(tree).toContain('→ 10')
  })

  it('formats a multi-step pipeline', () => {
    let time = 0
    const { trace } = tracedPipe(
      5,
      traced('double', (x: number) => x * 2),
      traced('addOne', (x: number) => x + 1),
      { clock: () => time++ },
    )

    const tree = toTreeString(trace, plain)

    expect(tree).toContain('double')
    expect(tree).toContain('addOne')
    expect(tree).toContain('├─')
    expect(tree).toContain('└─')
  })

  it('formats nested spans with indentation', () => {
    const inner = traced('inner', (x: number) => x + 1)
    const outer = traced('outer', (x: number) => inner(x * 2))
    const tracer = createTracer()
    const { trace } = tracer.run(() => outer(5))

    const tree = toTreeString(trace, plain)

    expect(tree).toContain('outer')
    expect(tree).toContain('inner')
  })

  it('truncates long string values', () => {
    const longString = 'a'.repeat(100)
    const fn = traced('fn', () => longString)
    const tracer = createTracer()
    const { trace } = tracer.run(() => fn())

    const tree = toTreeString(trace, plain)

    expect(tree).toContain('...')
  })

  it('produces colored output by default', () => {
    const fn = traced('double', (x: number) => x * 2)
    const tracer = createTracer()
    const { trace } = tracer.run(() => fn(5))

    const tree = toTreeString(trace)

    // Should contain ANSI escape codes
    expect(tree).toContain('\x1b[1m')  // bold
    expect(tree).toContain('\x1b[0m')  // reset
    expect(tree).toContain('\x1b[2m')  // dim
  })

  it('produces plain output with color: false', () => {
    const fn = traced('double', (x: number) => x * 2)
    const tracer = createTracer()
    const { trace } = tracer.run(() => fn(5))

    const tree = toTreeString(trace, plain)

    expect(tree).not.toContain('\x1b[')
  })
})

describe('toJSON', () => {
  it('produces serializable JSON', () => {
    const fn = traced('fn', (x: number) => x * 2)
    const tracer = createTracer()
    const { trace } = tracer.run(() => fn(5))

    const json = toJSON(trace)

    expect(json.id).toBe(trace.id)
    expect(json.rootSpan.name).toBe('fn')
    expect(json.rootSpan.input).toBe(5)
    expect(json.rootSpan.output).toBe(10)
    expect(json.totalDurationMs).toBeGreaterThanOrEqual(0)
    expect(json.spanCount).toBe(1)
  })

  it('includes nested spans', () => {
    const inner = traced('inner', (x: number) => x)
    const outer = traced('outer', (x: number) => inner(x))
    const tracer = createTracer()
    const { trace } = tracer.run(() => outer(5))

    const json = toJSON(trace)

    expect(json.rootSpan.children).toHaveLength(1)
    expect(json.rootSpan.children[0]!.name).toBe('inner')
    expect(json.spanCount).toBe(2)
  })

  it('is JSON.stringify-safe', () => {
    const fn = traced('fn', (x: number) => ({ value: x * 2 }))
    const tracer = createTracer()
    const { trace } = tracer.run(() => fn(5))

    const json = toJSON(trace)
    const str = JSON.stringify(json)

    expect(() => JSON.parse(str)).not.toThrow()
    const parsed = JSON.parse(str)
    expect(parsed.rootSpan.name).toBe('fn')
  })

  it('includes parent-child relationships', () => {
    const child = traced('child', (x: number) => x)
    const parent = traced('parent', (x: number) => child(x))
    const tracer = createTracer()
    const { trace } = tracer.run(() => parent(5))

    const json = toJSON(trace)

    expect(json.rootSpan.children[0]!.parentId).toBe(json.rootSpan.id)
  })
})
