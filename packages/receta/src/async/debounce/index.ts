import type { DebounceOptions } from '../types'
import { match, tryCatchAsync } from '../../result'

/** The calls waiting for one run. They share a promise, so handling any of them handles all. */
type Batch<T> = {
  readonly promise: Promise<T>
  readonly resolve: (value: T) => void
  readonly reject: (reason: unknown) => void
}

const createBatch = <T>(): Batch<T> => {
  let resolve!: Batch<T>['resolve']
  let reject!: Batch<T>['reject']
  const promise = new Promise<T>((settle, fail) => {
    resolve = settle
    reject = fail
  })
  return { promise, resolve, reject }
}

/** Rejects for a caller who awaits, without crashing a process that ignores the promise. */
const rejectQuietly = (message: string): Promise<never> => {
  const rejected = Promise.reject(new Error(message))
  rejected.catch(() => undefined)
  return rejected
}

const NOTHING_CAN_RUN = 'debounce: leading and trailing are both false, so fn never runs'

/**
 * Debounces an async function.
 *
 * Creates a debounced version of an async function that delays invoking
 * until after the specified delay has elapsed since the last call.
 *
 * Useful for rate-limiting API calls, search inputs, or any operation
 * that shouldn't run on every invocation.
 *
 * With `leading`, a call runs at once only after `delay` of silence since the last
 * call, so a burst gets one leading run however long it lasts.
 *
 * Every call settles. A call that a newer one replaces gets the result of the run
 * that replaced it, and with `trailing: false`, a call ignored during the delay gets
 * the result of the last leading run. If `leading` and `trailing` are both false,
 * nothing can run, so every call rejects. There is no `cancel` or `flush`.
 *
 * @param fn - Async function to debounce
 * @param options - Debounce options
 * @returns Debounced function
 *
 * @example
 * ```typescript
 * // Debounced search
 * const searchAPI = debounce(
 *   async (query: string) => {
 *     const res = await fetch(`/api/search?q=${query}`)
 *     return res.json()
 *   },
 *   { delay: 300 }
 * )
 *
 * // User types "hello" quickly
 * searchAPI('h')      // Replaced, settles with the result for 'hello'
 * searchAPI('he')     // Replaced
 * searchAPI('hel')    // Replaced
 * searchAPI('hell')   // Replaced
 * searchAPI('hello')  // Executes after 300ms
 *
 * // Leading edge debounce (execute immediately, ignore subsequent calls)
 * const saveData = debounce(
 *   async (data) => api.save(data),
 *   { delay: 1000, leading: true, trailing: false }
 * )
 * ```
 *
 * @see throttle - for limiting function calls to a fixed rate
 */
export function debounce<TArgs extends readonly unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  options: DebounceOptions
): (...args: TArgs) => Promise<TReturn> {
  const { delay, leading = false, trailing = true } = options

  let timeoutId: ReturnType<typeof setTimeout> | undefined
  let lastCall = -Infinity
  let lastRun: Promise<TReturn> | undefined
  // A later call replaces the arguments of a waiting call, never its promise.
  let batch: Batch<TReturn> | undefined

  const run = async (args: TArgs, running: Batch<TReturn>): Promise<void> => {
    batch = undefined

    match(await tryCatchAsync(() => fn(...args)), {
      onOk: running.resolve,
      onErr: running.reject,
    })
  }

  return (...args: TArgs): Promise<TReturn> => {
    const now = Date.now()
    const shouldExecuteLeading = leading && now - lastCall >= delay
    lastCall = now

    if (timeoutId !== undefined) {
      clearTimeout(timeoutId)
      timeoutId = undefined
    }

    if (!shouldExecuteLeading && !trailing) {
      return lastRun ?? rejectQuietly(NOTHING_CAN_RUN)
    }

    const waiting = (batch ??= createBatch<TReturn>())

    if (shouldExecuteLeading) {
      lastRun = waiting.promise
      void run(args, waiting)
    } else {
      timeoutId = setTimeout(() => {
        timeoutId = undefined
        void run(args, waiting)
      }, delay)
    }

    return waiting.promise
  }
}
