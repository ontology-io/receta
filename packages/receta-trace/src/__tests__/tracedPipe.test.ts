import { describe, it, expect } from 'vitest'
import { tracedPipe } from '../tracedPipe'
import { traced } from '../traced'

describe('tracedPipe', () => {
  it('pipes a single function', () => {
    const { result, trace } = tracedPipe(5, (x: number) => x * 2)

    expect(result).toBe(10)
    expect(trace.rootSpan).toBeDefined()
  })

  it('pipes multiple functions left-to-right', () => {
    const { result, trace } = tracedPipe(
      5,
      (x: number) => x * 2,
      (x: number) => x + 1,
      (x: number) => String(x),
    )

    expect(result).toBe('11')
    expect(trace.rootSpan.children).toHaveLength(3)
  })

  it('auto-names functions using fn.name', () => {
    function double(x: number) { return x * 2 }
    function addOne(x: number) { return x + 1 }

    const { trace } = tracedPipe(5, double, addOne)

    expect(trace.rootSpan.children[0]!.name).toBe('double')
    expect(trace.rootSpan.children[1]!.name).toBe('addOne')
  })

  it('falls back to step-N for anonymous functions', () => {
    const { trace } = tracedPipe(
      5,
      (x: number) => x * 2,
      (x: number) => x + 1,
    )

    expect(trace.rootSpan.children[0]!.name).toBe('step-0')
    expect(trace.rootSpan.children[1]!.name).toBe('step-1')
  })

  it('preserves explicit names from traced()', () => {
    const double = traced('double', (x: number) => x * 2)
    const addOne = traced('addOne', (x: number) => x + 1)

    const { result, trace } = tracedPipe(5, double, addOne)

    expect(result).toBe(11)
    expect(trace.rootSpan.children[0]!.name).toBe('double')
    expect(trace.rootSpan.children[1]!.name).toBe('addOne')
  })

  it('records inputs and outputs for each step', () => {
    const { trace } = tracedPipe(
      5,
      traced('double', (x: number) => x * 2),
      traced('addOne', (x: number) => x + 1),
    )

    const step1 = trace.rootSpan.children[0]!
    expect(step1.input).toBe(5)
    expect(step1.output).toBe(10)

    const step2 = trace.rootSpan.children[1]!
    expect(step2.input).toBe(10)
    expect(step2.output).toBe(11)
  })

  it('captures timing information', () => {
    let time = 0
    const clock = () => time++

    const { trace } = tracedPipe(
      5,
      traced('fn1', (x: number) => x * 2),
      traced('fn2', (x: number) => x + 1),
      { clock },
    )

    expect(trace.rootSpan.children[0]!.durationMs).toBeGreaterThanOrEqual(0)
  })

  it('accepts TracerOptions as last argument', () => {
    const { trace } = tracedPipe(
      5,
      traced('fn1', (x: number) => x * 2),
      traced('fn2', (x: number) => x + 1),
      { captureInputs: false },
    )

    expect(trace.rootSpan.children[0]!.input).toBeUndefined()
    expect(trace.rootSpan.children[1]!.output).toBe(11)
  })

  it('handles errors in pipeline steps', () => {
    expect(() =>
      tracedPipe(
        5,
        (x: number) => x * 2,
        () => { throw new Error('pipe error') },
      ),
    ).toThrow('pipe error')
  })
})
