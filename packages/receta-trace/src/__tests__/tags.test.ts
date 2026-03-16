import { describe, it, expect } from 'vitest'
import { traced } from '../traced'
import { createTracer } from '../tracer'
import { setTag, annotate } from '../span'
import { toTreeString, toJSON } from '../format'

describe('setTag', () => {
  it('sets tags on the current span', () => {
    const fn = traced('fn', () => {
      setTag('userId', 'user-123')
      setTag('region', 'us-east-1')
      return 42
    })

    const tracer = createTracer()
    const { trace } = tracer.run(() => fn())

    expect(trace.rootSpan.tags).toEqual({
      userId: 'user-123',
      region: 'us-east-1',
    })
  })

  it('is a no-op when no tracer is active', () => {
    setTag('orphan', 'ignored')
    // Should not throw
  })

  it('overwrites existing tags', () => {
    const fn = traced('fn', () => {
      setTag('status', 'pending')
      setTag('status', 'completed')
      return 1
    })

    const tracer = createTracer()
    const { trace } = tracer.run(() => fn())

    expect(trace.rootSpan.tags['status']).toBe('completed')
  })

  it('attaches tags to the correct nested span', () => {
    const inner = traced('inner', () => {
      setTag('inner-key', 'inner-val')
      return 1
    })
    const outer = traced('outer', () => {
      setTag('outer-key', 'outer-val')
      return inner()
    })

    const tracer = createTracer()
    const { trace } = tracer.run(() => outer())

    expect(trace.rootSpan.tags).toEqual({ 'outer-key': 'outer-val' })
    expect(trace.rootSpan.children[0]!.tags).toEqual({ 'inner-key': 'inner-val' })
  })

  it('tags appear in toTreeString output', () => {
    const fn = traced('fn', () => {
      setTag('orderId', 'ORD-001')
      return 42
    })

    const tracer = createTracer()
    const { trace } = tracer.run(() => fn())
    const tree = toTreeString(trace, { color: false })

    expect(tree).toContain('orderId=')
    expect(tree).toContain('ORD-001')
  })

  it('tags appear in toJSON output', () => {
    const fn = traced('fn', () => {
      setTag('x', 1)
      return 42
    })

    const tracer = createTracer()
    const { trace } = tracer.run(() => fn())
    const json = toJSON(trace)

    expect(json.rootSpan.tags).toEqual({ x: 1 })
  })

  it('supports various value types', () => {
    const fn = traced('fn', () => {
      setTag('string', 'hello')
      setTag('number', 42)
      setTag('boolean', true)
      setTag('array', [1, 2, 3])
      return 1
    })

    const tracer = createTracer()
    const { trace } = tracer.run(() => fn())

    expect(trace.rootSpan.tags).toEqual({
      string: 'hello',
      number: 42,
      boolean: true,
      array: [1, 2, 3],
    })
  })
})

describe('annotate', () => {
  it('is an alias for setTag', () => {
    const fn = traced('fn', () => {
      annotate('transactionId', 'txn-abc')
      annotate('provider', 'stripe')
      return 1
    })

    const tracer = createTracer()
    const { trace } = tracer.run(() => fn())

    expect(trace.rootSpan.tags).toEqual({
      transactionId: 'txn-abc',
      provider: 'stripe',
    })
  })
})
