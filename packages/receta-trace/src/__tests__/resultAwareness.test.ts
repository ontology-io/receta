import { describe, it, expect } from 'vitest'
import { traced } from '../traced'
import { createTracer } from '../tracer'

describe('Result/Option awareness', () => {
  it('marks span as error when function returns Err result', () => {
    const fn = traced('validate', () => ({
      _tag: 'Err' as const,
      error: { code: 'INVALID', message: 'Bad input' },
    }))

    const tracer = createTracer()
    const { trace } = tracer.run(() => fn())

    expect(trace.rootSpan.status).toBe('error')
    expect(trace.rootSpan.error).toEqual({ code: 'INVALID', message: 'Bad input' })
  })

  it('keeps span as ok when function returns Ok result', () => {
    const fn = traced('parse', () => ({
      _tag: 'Ok' as const,
      value: { name: 'Alice' },
    }))

    const tracer = createTracer()
    const { trace } = tracer.run(() => fn())

    expect(trace.rootSpan.status).toBe('ok')
  })

  it('keeps span as ok for non-Result return values', () => {
    const fn = traced('compute', () => 42)
    const tracer = createTracer()
    const { trace } = tracer.run(() => fn())

    expect(trace.rootSpan.status).toBe('ok')
  })

  it('keeps span as ok for null/undefined returns', () => {
    const fn1 = traced('null', () => null)
    const fn2 = traced('undef', () => undefined)
    const tracer = createTracer()

    const { trace: t1 } = tracer.run(() => fn1())
    const { trace: t2 } = tracer.run(() => fn2())

    expect(t1.rootSpan.status).toBe('ok')
    expect(t2.rootSpan.status).toBe('ok')
  })

  it('detects Err in async functions', async () => {
    const fn = traced('asyncValidate', async () => ({
      _tag: 'Err' as const,
      error: 'async failure',
    }))

    const tracer = createTracer()
    const { trace } = await tracer.runAsync(async () => fn())

    expect(trace.rootSpan.status).toBe('error')
    expect(trace.rootSpan.error).toBe('async failure')
  })

  it('still captures output alongside error status for Err results', () => {
    const fn = traced('fn', () => ({
      _tag: 'Err' as const,
      error: 'fail',
    }))

    const tracer = createTracer()
    const { trace } = tracer.run(() => fn())

    // Output is captured (the full Err object) AND status is error
    expect(trace.rootSpan.output).toEqual({ _tag: 'Err', error: 'fail' })
    expect(trace.rootSpan.status).toBe('error')
  })
})
