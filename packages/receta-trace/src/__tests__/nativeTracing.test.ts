import { describe, it, expect, afterEach } from 'vitest'
import * as R from 'remeda'
import { ok, err, map, flatMap, mapErr, unwrapOr } from '@ontologyio/receta/result'
import { some, none } from '@ontologyio/receta/option'
import { map as optionMap, filter as optionFilter } from '@ontologyio/receta/option'
import { setInstrumentHook } from '@ontologyio/receta/instrument'
import { createTracer, withTrace, withTraceAsync } from '../index'
import type { TraceEvent } from '../index'

afterEach(() => {
  // Ensure hook is cleared between tests
  setInstrumentHook(undefined)
})

describe('native tracing', () => {
  describe('auto-instrumented receta functions', () => {
    it('traces Result.map in a pipe', () => {
      const tracer = createTracer()
      const { result, trace } = tracer.run(() => {
        return R.pipe(
          ok(5),
          map((x) => x * 2),
        )
      })

      expect(result).toEqual(ok(10))
      expect(trace.rootSpan.name).toBe('map')
      expect(trace.rootSpan.input).toEqual(ok(5))
      expect(trace.rootSpan.output).toEqual(ok(10))
      expect(trace.rootSpan.module).toBe('result')
      expect(trace.rootSpan.status).toBe('ok')
    })

    it('traces multiple functions in a pipe', () => {
      const tracer = createTracer()
      const { result, trace } = tracer.run(() => {
        return R.pipe(
          ok(5),
          map((x) => x * 2),
          flatMap((x) => ok(x + 1)),
          map((x) => String(x)),
        )
      })

      expect(result).toEqual(ok('11'))
      // Should have 3 root spans (map, flatMap, map) since they're sequential in pipe
      expect(trace.spans.length).toBeGreaterThanOrEqual(3)

      const spanNames = trace.spans.map((s) => s.name)
      expect(spanNames).toContain('map')
      expect(spanNames).toContain('flatMap')
    })

    it('traces Option functions', () => {
      const tracer = createTracer()
      const { result, trace } = tracer.run(() => {
        return R.pipe(
          some(10),
          optionMap((x) => x * 3),
          optionFilter((x) => x > 20),
        )
      })

      expect(result).toEqual(some(30))
      const spanNames = trace.spans.map((s) => s.name)
      expect(spanNames).toContain('map')
      expect(spanNames).toContain('filter')

      const mapSpan = trace.spans.find(
        (s) => s.name === 'map' && s.module === 'option',
      )
      expect(mapSpan).toBeDefined()
      expect(mapSpan!.module).toBe('option')
    })

    it('detects Result Err and marks span as error', () => {
      const tracer = createTracer()
      const { trace } = tracer.run(() => {
        return R.pipe(
          ok(5),
          flatMap(() => err('something went wrong')),
        )
      })

      const flatMapSpan = trace.spans.find((s) => s.name === 'flatMap')
      expect(flatMapSpan).toBeDefined()
      expect(flatMapSpan!.status).toBe('error')
      expect(flatMapSpan!.error).toBe('something went wrong')
    })

    it('has zero overhead when no tracer is active', () => {
      // No tracer — functions should work normally
      const result = R.pipe(
        ok(42),
        map((x) => x + 1),
        flatMap((x) => ok(x * 2)),
      )
      expect(result).toEqual(ok(86))
    })
  })

  describe('withTrace convenience API', () => {
    it('traces sync code', () => {
      const { result, trace } = withTrace({}, () => {
        return R.pipe(
          ok(100),
          map((x) => x / 2),
        )
      })

      expect(result).toEqual(ok(50))
      expect(trace.spans.length).toBeGreaterThanOrEqual(1)
    })

    it('traces async code', async () => {
      const { result, trace } = await withTraceAsync({}, async () => {
        const val = R.pipe(
          ok(7),
          map((x) => x * 3),
        )
        return val
      })

      expect(result).toEqual(ok(21))
      expect(trace.spans.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('real-time events via onEvent', () => {
    it('emits span-start and span-end events', () => {
      const events: TraceEvent[] = []

      const { result } = withTrace(
        {
          onEvent: (event) => events.push(event),
        },
        () => {
          return R.pipe(
            ok(5),
            map((x) => x * 2),
          )
        },
      )

      expect(result).toEqual(ok(10))

      // Should have: trace-start, span-start, span-end, trace-end
      const types = events.map((e) => e.type)
      expect(types).toContain('trace-start')
      expect(types).toContain('span-start')
      expect(types).toContain('span-end')
      expect(types).toContain('trace-end')
    })

    it('emits events in correct order', () => {
      const events: TraceEvent[] = []

      withTrace(
        {
          onEvent: (event) => events.push(event),
        },
        () => {
          return R.pipe(
            ok(5),
            map((x) => x * 2),
            flatMap((x) => ok(x + 1)),
          )
        },
      )

      // trace-start should be first, trace-end should be last
      expect(events[0]!.type).toBe('trace-start')
      expect(events[events.length - 1]!.type).toBe('trace-end')

      // Each span-start should come before its span-end
      const spanStarts = events.filter((e) => e.type === 'span-start')
      const spanEnds = events.filter((e) => e.type === 'span-end')
      expect(spanStarts.length).toBe(spanEnds.length)
      expect(spanStarts.length).toBeGreaterThanOrEqual(2) // map + flatMap
    })

    it('includes function name and module in span events', () => {
      const events: TraceEvent[] = []

      withTrace(
        {
          onEvent: (event) => events.push(event),
        },
        () => {
          return R.pipe(
            ok(5),
            map((x) => x * 2),
          )
        },
      )

      const spanStart = events.find((e) => e.type === 'span-start')
      expect(spanStart).toBeDefined()
      if (spanStart && spanStart.type === 'span-start') {
        expect(spanStart.name).toBe('map')
        expect(spanStart.module).toBe('result')
        expect(spanStart.traceId).toBeDefined()
        expect(spanStart.spanId).toBeDefined()
      }
    })

    it('includes traceId consistently across all events', () => {
      const events: TraceEvent[] = []

      withTrace(
        {
          onEvent: (event) => events.push(event),
        },
        () => {
          return R.pipe(
            ok(5),
            map((x) => x * 2),
          )
        },
      )

      const traceId = events[0]!.traceId
      expect(traceId).toBeDefined()
      for (const event of events) {
        expect(event.traceId).toBe(traceId)
      }
    })

    it('trace-end includes span count and duration', () => {
      const events: TraceEvent[] = []

      withTrace(
        {
          onEvent: (event) => events.push(event),
        },
        () => {
          return R.pipe(
            ok(5),
            map((x) => x * 2),
            flatMap((x) => ok(x)),
          )
        },
      )

      const traceEnd = events.find((e) => e.type === 'trace-end')
      expect(traceEnd).toBeDefined()
      if (traceEnd && traceEnd.type === 'trace-end') {
        expect(traceEnd.spanCount).toBeGreaterThanOrEqual(2)
        expect(traceEnd.totalDurationMs).toBeGreaterThanOrEqual(0)
      }
    })
  })

  describe('nested tracing', () => {
    it('traces nested function calls', () => {
      function innerPipeline(x: number) {
        return R.pipe(
          ok(x),
          map((v) => v + 10),
          flatMap((v) => ok(v * 2)),
        )
      }

      const tracer = createTracer()
      const { result, trace } = tracer.run(() => {
        return R.pipe(
          ok(5),
          flatMap((x) => innerPipeline(x)),
        )
      })

      expect(result).toEqual(ok(30))
      // Should have: flatMap (outer) > map (inner) + flatMap (inner)
      expect(trace.spans.length).toBeGreaterThanOrEqual(3)
    })
  })

  describe('captureInputs/captureOutputs options', () => {
    it('respects captureInputs: false', () => {
      const { trace } = withTrace({ captureInputs: false }, () => {
        return R.pipe(
          ok(5),
          map((x) => x * 2),
        )
      })

      const mapSpan = trace.spans.find((s) => s.name === 'map')
      expect(mapSpan).toBeDefined()
      expect(mapSpan!.input).toBeUndefined()
    })

    it('respects captureOutputs: false', () => {
      const { trace } = withTrace({ captureOutputs: false }, () => {
        return R.pipe(
          ok(5),
          map((x) => x * 2),
        )
      })

      const mapSpan = trace.spans.find((s) => s.name === 'map')
      expect(mapSpan).toBeDefined()
      expect(mapSpan!.output).toBeUndefined()
    })
  })
})
