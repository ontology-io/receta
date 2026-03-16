import { describe, it, expect } from 'vitest'
import { createTracer } from '../tracer'
import { tracedRetry, tracedTimeout, tracedMapAsync } from '../async'

// Simple mock implementations matching receta async signatures
async function mockRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number
    delay?: number
    onRetry?: (error: unknown, attempt: number, delay: number) => void
  } = {},
): Promise<{ _tag: 'Ok'; value: T } | { _tag: 'Err'; error: unknown }> {
  const maxAttempts = options.maxAttempts ?? 3
  let lastError: unknown
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const value = await fn()
      return { _tag: 'Ok', value }
    } catch (error) {
      lastError = error
      if (attempt < maxAttempts) {
        options.onRetry?.(error, attempt, options.delay ?? 0)
      }
    }
  }
  return { _tag: 'Err', error: { type: 'max_attempts_exceeded', lastError, attempts: maxAttempts } }
}

async function mockTimeout<T>(
  promise: Promise<T>,
  _ms: number,
): Promise<{ _tag: 'Ok'; value: T }> {
  const value = await promise
  return { _tag: 'Ok', value }
}

async function mockMapAsync<T, U>(
  items: readonly T[],
  fn: (item: T, index: number) => Promise<U>,
  _options?: { concurrency?: number },
): Promise<{ _tag: 'Ok'; value: U[] }> {
  const results: U[] = []
  for (let i = 0; i < items.length; i++) {
    results.push(await fn(items[i]!, i))
  }
  return { _tag: 'Ok', value: results }
}

describe('tracedRetry', () => {
  it('records a retry span with attempt events', async () => {
    let callCount = 0
    const tracer = createTracer()

    const { trace } = await tracer.runAsync(async () =>
      tracedRetry(
        mockRetry,
        async () => {
          callCount++
          if (callCount < 3) throw new Error('fail')
          return 'success'
        },
        { maxAttempts: 3 },
      ),
    )

    const retrySpan = trace.rootSpan
    expect(retrySpan.name).toBe('retry')
    expect(retrySpan.tags['maxAttempts']).toBe(3)
    expect(retrySpan.tags['totalAttempts']).toBe(3)

    const events = retrySpan.events
    // attempt 1, attempt-failed 1, retry-wait 1, attempt 2, attempt-failed 2, retry-wait 2, attempt 3, attempt-ok 3
    expect(events.some((e) => e.name === 'attempt')).toBe(true)
    expect(events.some((e) => e.name === 'attempt-failed')).toBe(true)
    expect(events.some((e) => e.name === 'attempt-ok')).toBe(true)
  })

  it('supports custom span name', async () => {
    const tracer = createTracer()

    const { trace } = await tracer.runAsync(async () =>
      tracedRetry(
        mockRetry,
        async () => 'ok',
        { name: 'fetchWithRetry' },
      ),
    )

    expect(trace.rootSpan.name).toBe('fetchWithRetry')
  })
})

describe('tracedTimeout', () => {
  it('records a timeout span with limit tag', async () => {
    const tracer = createTracer()

    const { trace } = await tracer.runAsync(async () =>
      tracedTimeout(
        mockTimeout,
        Promise.resolve('data'),
        5000,
      ),
    )

    const span = trace.rootSpan
    expect(span.name).toBe('timeout')
    expect(span.tags['limitMs']).toBe(5000)
    expect(span.events.some((e) => e.name === 'completed')).toBe(true)
  })

  it('supports custom span name', async () => {
    const tracer = createTracer()

    const { trace } = await tracer.runAsync(async () =>
      tracedTimeout(mockTimeout, Promise.resolve(1), 1000, 'fetchTimeout'),
    )

    expect(trace.rootSpan.name).toBe('fetchTimeout')
  })
})

describe('tracedMapAsync', () => {
  it('records a mapAsync span with item events', async () => {
    const tracer = createTracer()

    const { trace } = await tracer.runAsync(async () =>
      tracedMapAsync(
        mockMapAsync,
        [1, 2, 3],
        async (x) => x * 2,
        { concurrency: 2 },
      ),
    )

    const span = trace.rootSpan
    expect(span.name).toBe('mapAsync')
    expect(span.tags['items']).toBe(3)
    expect(span.tags['concurrency']).toBe(2)

    const startEvents = span.events.filter((e) => e.name === 'item-start')
    const endEvents = span.events.filter((e) => e.name === 'item-end')
    expect(startEvents).toHaveLength(3)
    expect(endEvents).toHaveLength(3)
  })

  it('supports custom span name', async () => {
    const tracer = createTracer()

    const { trace } = await tracer.runAsync(async () =>
      tracedMapAsync(mockMapAsync, [1], async (x) => x, { name: 'fetchAll' }),
    )

    expect(trace.rootSpan.name).toBe('fetchAll')
  })
})
