import { describe, it, expect, vi } from 'vitest'
import { createTracer } from '../tracer'
import { traced } from '../traced'

describe('createTracer', () => {
  describe('run (sync)', () => {
    it('returns result and trace', () => {
      const double = traced('double', (x: number) => x * 2)
      const tracer = createTracer()

      const { result, trace } = tracer.run(() => double(5))

      expect(result).toBe(10)
      expect(trace.id).toBeDefined()
      expect(trace.rootSpan).toBeDefined()
      expect(trace.totalDurationMs).toBeGreaterThanOrEqual(0)
    })

    it('collects multiple sequential spans', () => {
      const double = traced('double', (x: number) => x * 2)
      const addOne = traced('addOne', (x: number) => x + 1)
      const tracer = createTracer()

      const { result, trace } = tracer.run(() => {
        const a = double(5)
        return addOne(a)
      })

      expect(result).toBe(11)
      // Two root-level spans → wrapped in synthetic root
      expect(trace.rootSpan.children).toHaveLength(2)
      expect(trace.rootSpan.children[0]!.name).toBe('double')
      expect(trace.rootSpan.children[1]!.name).toBe('addOne')
    })

    it('flat spans list contains all spans', () => {
      const inner = traced('inner', (x: number) => x)
      const outer = traced('outer', (x: number) => inner(x))
      const tracer = createTracer()

      const { trace } = tracer.run(() => outer(5))

      // rootSpan (outer) + 1 child (inner) = 2 spans
      expect(trace.spans).toHaveLength(2)
    })

    it('calls onSpan callback for each span', () => {
      const onSpan = vi.fn()
      const fn = traced('fn', (x: number) => x)
      const tracer = createTracer({ onSpan })

      tracer.run(() => fn(5))

      expect(onSpan).toHaveBeenCalledTimes(1)
      expect(onSpan.mock.calls[0]![0]).toMatchObject({
        name: 'fn',
        status: 'ok',
      })
    })

    it('uses custom clock', () => {
      let time = 0
      const clock = () => time++
      const fn = traced('fn', (x: number) => x)
      const tracer = createTracer({ clock })

      const { trace } = tracer.run(() => fn(5))

      expect(trace.rootSpan.startTime).toBe(0)
      expect(trace.rootSpan.endTime).toBe(1)
      expect(trace.rootSpan.durationMs).toBe(1)
    })

    it('uses custom generateId', () => {
      let counter = 0
      const generateId = () => `id-${counter++}`
      const fn = traced('fn', (x: number) => x)
      const tracer = createTracer({ generateId })

      const { trace } = tracer.run(() => fn(5))

      // Trace ID generated first, then span ID
      expect(trace.id).toBe('id-0')
      expect(trace.rootSpan.id).toBe('id-1')
    })
  })

  describe('runAsync', () => {
    it('returns result and trace for async execution', async () => {
      const fetchData = traced('fetch', async () => 'data')
      const tracer = createTracer()

      const { result, trace } = await tracer.runAsync(async () => fetchData())

      expect(result).toBe('data')
      expect(trace.rootSpan.name).toBe('fetch')
    })

    it('handles sequential async operations', async () => {
      const step1 = traced('step1', async (x: number) => x * 2)
      const step2 = traced('step2', async (x: number) => x + 1)
      const tracer = createTracer()

      const { result, trace } = await tracer.runAsync(async () => {
        const a = await step1(5)
        return step2(a)
      })

      expect(result).toBe(11)
      expect(trace.rootSpan.children).toHaveLength(2)
    })

    it('captures errors in async spans', async () => {
      const failAsync = traced('failAsync', async () => {
        throw new Error('async boom')
      })
      const tracer = createTracer()

      await expect(
        tracer.runAsync(async () => failAsync()),
      ).rejects.toThrow('async boom')
    })
  })

  describe('isolation', () => {
    it('independent tracers produce independent traces', () => {
      const fn = traced('fn', (x: number) => x)
      const tracer1 = createTracer()
      const tracer2 = createTracer()

      const { trace: trace1 } = tracer1.run(() => fn(1))
      const { trace: trace2 } = tracer2.run(() => fn(2))

      expect(trace1.rootSpan.input).toBe(1)
      expect(trace2.rootSpan.input).toBe(2)
      expect(trace1.id).not.toBe(trace2.id)
    })
  })
})
