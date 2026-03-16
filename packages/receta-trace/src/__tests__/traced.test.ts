import { describe, it, expect } from 'vitest'
import { traced, isTraced } from '../traced'
import { createTracer } from '../tracer'

describe('traced', () => {
  describe('metadata', () => {
    it('attaches string name as metadata', () => {
      const fn = traced('myFn', (x: number) => x * 2)
      expect(fn.__trace_meta).toEqual({ name: 'myFn' })
    })

    it('attaches full metadata object', () => {
      const meta = { name: 'fetchUser', module: 'users', category: 'io' }
      const fn = traced(meta, (id: string) => id)
      expect(fn.__trace_meta).toEqual(meta)
    })

    it('preserves function name', () => {
      const fn = traced('double', (x: number) => x * 2)
      expect(fn.name).toBe('double')
    })

    it('preserves function length', () => {
      const fn = traced('add', (a: number, b: number) => a + b)
      expect(fn.length).toBe(2)
    })
  })

  describe('without tracer (zero-overhead path)', () => {
    it('calls function directly and returns result', () => {
      const fn = traced('double', (x: number) => x * 2)
      expect(fn(5)).toBe(10)
    })

    it('passes all arguments through', () => {
      const fn = traced('add', (a: number, b: number) => a + b)
      expect(fn(3, 4)).toBe(7)
    })

    it('propagates errors', () => {
      const fn = traced('fail', () => {
        throw new Error('boom')
      })
      expect(() => fn()).toThrow('boom')
    })
  })

  describe('with tracer', () => {
    it('records a span when tracer is active', () => {
      const double = traced('double', (x: number) => x * 2)
      const tracer = createTracer()

      const { result, trace } = tracer.run(() => double(5))

      expect(result).toBe(10)
      expect(trace.spans).toHaveLength(1)
      expect(trace.rootSpan.name).toBe('double')
      expect(trace.rootSpan.input).toBe(5)
      expect(trace.rootSpan.output).toBe(10)
      expect(trace.rootSpan.status).toBe('ok')
    })

    it('records error spans', () => {
      const fail = traced('fail', () => {
        throw new Error('boom')
      })
      const tracer = createTracer()

      expect(() => tracer.run(() => fail())).toThrow('boom')
    })

    it('records nested spans with parent-child', () => {
      const inner = traced('inner', (x: number) => x + 1)
      const outer = traced('outer', (x: number) => inner(x * 2))
      const tracer = createTracer()

      const { result, trace } = tracer.run(() => outer(5))

      expect(result).toBe(11)
      expect(trace.rootSpan.name).toBe('outer')
      expect(trace.rootSpan.children).toHaveLength(1)
      expect(trace.rootSpan.children[0]!.name).toBe('inner')
      expect(trace.rootSpan.children[0]!.input).toBe(10)
      expect(trace.rootSpan.children[0]!.output).toBe(11)
    })

    it('respects maxDepth', () => {
      const deep = traced('deep', (x: number) => x)
      const mid = traced('mid', (x: number) => deep(x))
      const top = traced('top', (x: number) => mid(x))
      const tracer = createTracer({ maxDepth: 1 })

      const { result, trace } = tracer.run(() => top(5))

      expect(result).toBe(5)
      // Only top span recorded, mid and deep skipped due to maxDepth
      expect(trace.rootSpan.name).toBe('top')
      expect(trace.rootSpan.children).toHaveLength(0)
    })

    it('respects captureInputs: false', () => {
      const fn = traced('fn', (x: number) => x * 2)
      const tracer = createTracer({ captureInputs: false })

      const { trace } = tracer.run(() => fn(5))
      expect(trace.rootSpan.input).toBeUndefined()
      expect(trace.rootSpan.output).toBe(10)
    })

    it('respects captureOutputs: false', () => {
      const fn = traced('fn', (x: number) => x * 2)
      const tracer = createTracer({ captureOutputs: false })

      const { trace } = tracer.run(() => fn(5))
      expect(trace.rootSpan.input).toBe(5)
      expect(trace.rootSpan.output).toBeUndefined()
    })
  })

  describe('async functions', () => {
    it('traces async functions', async () => {
      const fetchData = traced('fetchData', async (id: string) => {
        return { id, name: 'Alice' }
      })
      const tracer = createTracer()

      const { result, trace } = await tracer.runAsync(async () => fetchData('123'))

      expect(result).toEqual({ id: '123', name: 'Alice' })
      expect(trace.rootSpan.name).toBe('fetchData')
      expect(trace.rootSpan.input).toBe('123')
      expect(trace.rootSpan.output).toEqual({ id: '123', name: 'Alice' })
    })
  })
})

describe('isTraced', () => {
  it('returns true for traced functions', () => {
    const fn = traced('fn', () => {})
    expect(isTraced(fn)).toBe(true)
  })

  it('returns false for regular functions', () => {
    const fn = () => {}
    expect(isTraced(fn)).toBe(false)
  })
})
