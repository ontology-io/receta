import { traced } from './traced'
import { emitEvent, setTag } from './span'
import type { Span } from './types'

/**
 * Retry options matching @ontologyio/receta/async RetryOptions.
 */
interface RetryOptions {
  readonly maxAttempts?: number
  readonly delay?: number
  readonly backoff?: number
  readonly maxDelay?: number
  readonly shouldRetry?: (error: unknown, attempt: number) => boolean
  readonly onRetry?: (error: unknown, attempt: number, delay: number) => void
}

/**
 * Concurrency options matching @ontologyio/receta/async ConcurrencyOptions.
 */
interface ConcurrencyOptions {
  readonly concurrency?: number
}

/**
 * Traced wrapper for retry operations.
 *
 * Creates a span named "retry" (or custom name) that records each attempt
 * as an event. Shows attempt count, delays, and which attempt succeeded.
 *
 * @example
 * ```typescript
 * import { tracedRetry } from '@ontologyio/receta-trace'
 * import { retry } from '@ontologyio/receta/async'
 *
 * const result = await tracedRetry(
 *   retry,
 *   () => fetchUser(id),
 *   { maxAttempts: 3, delay: 1000 }
 * )
 * // Span: "retry" with events showing each attempt
 * ```
 */
export async function tracedRetry<T>(
  retryFn: (fn: () => Promise<T>, options?: RetryOptions) => Promise<any>,
  fn: () => Promise<T>,
  options: RetryOptions & { readonly name?: string } = {},
): Promise<any> {
  const { name = 'retry', ...retryOptions } = options

  const tracedFn = traced(name, async () => {
    setTag('maxAttempts', retryOptions.maxAttempts ?? 3)
    setTag('delay', retryOptions.delay ?? 1000)

    let attemptCount = 0

    const result = await retryFn(
      async () => {
        attemptCount++
        emitEvent('attempt', { attempt: attemptCount })
        try {
          const value = await fn()
          emitEvent('attempt-ok', { attempt: attemptCount })
          return value
        } catch (error) {
          emitEvent('attempt-failed', {
            attempt: attemptCount,
            error: error instanceof Error ? error.message : String(error),
          })
          throw error
        }
      },
      {
        ...retryOptions,
        onRetry: (error, attempt, delay) => {
          emitEvent('retry-wait', { attempt, delayMs: delay })
          retryOptions.onRetry?.(error, attempt, delay)
        },
      },
    )

    setTag('totalAttempts', attemptCount)
    return result
  })

  return tracedFn()
}

/**
 * Traced wrapper for timeout operations.
 *
 * Creates a span that records the timeout limit and whether the operation
 * timed out or completed in time.
 *
 * @example
 * ```typescript
 * import { tracedTimeout } from '@ontologyio/receta-trace'
 * import { timeout } from '@ontologyio/receta/async'
 *
 * const result = await tracedTimeout(
 *   timeout,
 *   fetch('/api/data'),
 *   5000
 * )
 * // Span: "timeout" with tag { limitMs: 5000 }
 * ```
 */
export async function tracedTimeout<T>(
  timeoutFn: (promise: Promise<T>, ms: number) => Promise<any>,
  promise: Promise<T>,
  ms: number,
  name: string = 'timeout',
): Promise<any> {
  const tracedFn = traced(name, async () => {
    setTag('limitMs', ms)
    const startTime = performance.now()
    const result = await timeoutFn(promise, ms)
    const elapsed = performance.now() - startTime
    setTag('elapsedMs', Math.round(elapsed * 100) / 100)

    // Check if result is a timeout error (Result Err with TimeoutError)
    if (
      typeof result === 'object' &&
      result !== null &&
      '_tag' in result &&
      (result as { _tag: string })._tag === 'Err'
    ) {
      emitEvent('timed-out', { limitMs: ms, elapsedMs: elapsed })
    } else {
      emitEvent('completed', { elapsedMs: elapsed })
    }

    return result
  })

  return tracedFn()
}

/**
 * Traced wrapper for mapAsync operations.
 *
 * Creates a span that records concurrency settings and emits events
 * for each item start/end, showing the execution timeline.
 *
 * @example
 * ```typescript
 * import { tracedMapAsync } from '@ontologyio/receta-trace'
 * import { mapAsync } from '@ontologyio/receta/async'
 *
 * const result = await tracedMapAsync(
 *   mapAsync,
 *   urls,
 *   (url) => fetch(url),
 *   { concurrency: 3 }
 * )
 * // Span: "mapAsync" with tags { items: 5, concurrency: 3 }
 * //   events showing item-start/item-end for each item
 * ```
 */
export async function tracedMapAsync<T, U>(
  mapAsyncFn: (
    items: readonly T[],
    fn: (item: T, index: number) => Promise<U>,
    options?: ConcurrencyOptions,
  ) => Promise<any>,
  items: readonly T[],
  fn: (item: T, index: number) => Promise<U>,
  options: ConcurrencyOptions & { readonly name?: string } = {},
): Promise<any> {
  const { name = 'mapAsync', ...mapOptions } = options

  const tracedFn = traced(name, async () => {
    setTag('items', items.length)
    setTag('concurrency', mapOptions.concurrency ?? Infinity)

    const result = await mapAsyncFn(
      items,
      async (item, index) => {
        emitEvent('item-start', { index })
        try {
          const value = await fn(item, index)
          emitEvent('item-end', { index })
          return value
        } catch (error) {
          emitEvent('item-error', {
            index,
            error: error instanceof Error ? error.message : String(error),
          })
          throw error
        }
      },
      mapOptions,
    )

    return result
  })

  return tracedFn()
}
