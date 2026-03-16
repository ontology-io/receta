import { describe, it, expect } from 'vitest'
import { traced } from '../traced'
import { createTracer } from '../tracer'
import { emitEvent } from '../span'
import { toTreeString, toJSON } from '../format'

describe('emitEvent', () => {
  it('records events on the current span', () => {
    const fn = traced('fn', () => {
      emitEvent('step-1', { key: 'value' })
      emitEvent('step-2')
      return 42
    })

    const tracer = createTracer()
    const { trace } = tracer.run(() => fn())

    expect(trace.rootSpan.events).toHaveLength(2)
    expect(trace.rootSpan.events[0]!.name).toBe('step-1')
    expect(trace.rootSpan.events[0]!.data).toEqual({ key: 'value' })
    expect(trace.rootSpan.events[1]!.name).toBe('step-2')
    expect(trace.rootSpan.events[1]!.data).toBeUndefined()
  })

  it('records timestamps on events', () => {
    let time = 0
    const clock = () => time++
    const fn = traced('fn', () => {
      emitEvent('evt')
      return 1
    })

    const tracer = createTracer({ clock })
    const { trace } = tracer.run(() => fn())

    // span start = 0, event = 1, span end = 2
    expect(trace.rootSpan.events[0]!.timestamp).toBe(1)
  })

  it('is a no-op when no tracer is active', () => {
    // Should not throw
    emitEvent('orphan', { data: 'ignored' })
  })

  it('attaches events to the correct nested span', () => {
    const inner = traced('inner', () => {
      emitEvent('inner-event')
      return 'done'
    })
    const outer = traced('outer', () => {
      emitEvent('outer-event')
      return inner()
    })

    const tracer = createTracer()
    const { trace } = tracer.run(() => outer())

    expect(trace.rootSpan.events).toHaveLength(1)
    expect(trace.rootSpan.events[0]!.name).toBe('outer-event')
    expect(trace.rootSpan.children[0]!.events).toHaveLength(1)
    expect(trace.rootSpan.children[0]!.events[0]!.name).toBe('inner-event')
  })

  it('events appear in toTreeString output', () => {
    const fn = traced('fn', () => {
      emitEvent('cache-hit', { key: 'user:123' })
      return 42
    })

    const tracer = createTracer()
    const { trace } = tracer.run(() => fn())
    const tree = toTreeString(trace, { color: false })

    expect(tree).toContain('cache-hit')
  })

  it('events appear in toJSON output', () => {
    const fn = traced('fn', () => {
      emitEvent('step', { x: 1 })
      return 42
    })

    const tracer = createTracer()
    const { trace } = tracer.run(() => fn())
    const json = toJSON(trace)

    expect(json.rootSpan.events).toHaveLength(1)
    expect(json.rootSpan.events[0]!.name).toBe('step')
    expect(json.rootSpan.events[0]!.data).toEqual({ x: 1 })
  })
})
