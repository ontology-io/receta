import * as R from 'remeda'
import type { DebounceOptions } from '../types'
import { match, tryCatchAsync } from '../../result'

type Waiter<T> = {
  readonly resolve: (value: T) => void
  readonly reject: (reason: unknown) => void
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
  let lastInvocation = 0
  let lastRun: Promise<TReturn> | undefined
  // A later call replaces the arguments of a waiting call, never its promise.
  let waiting: Waiter<TReturn>[] = []

  const run = async (args: TArgs): Promise<void> => {
    lastInvocation = Date.now()
    const settling = waiting
    waiting = []

    match(await tryCatchAsync(() => fn(...args)), {
      onOk: (value) => R.forEach(settling, ({ resolve }) => resolve(value)),
      onErr: (error) => R.forEach(settling, ({ reject }) => reject(error)),
    })
  }

  return (...args: TArgs): Promise<TReturn> => {
    const shouldExecuteLeading = leading && Date.now() - lastInvocation >= delay

    if (timeoutId !== undefined) {
      clearTimeout(timeoutId)
      timeoutId = undefined
    }

    if (!shouldExecuteLeading && !trailing) {
      return lastRun ?? Promise.reject(new Error(NOTHING_CAN_RUN))
    }

    const settled = new Promise<TReturn>((resolve, reject) => {
      waiting.push({ resolve, reject })
    })

    if (shouldExecuteLeading) {
      lastRun = settled
      void run(args)
    } else {
      timeoutId = setTimeout(() => {
        timeoutId = undefined
        void run(args)
      }, delay)
    }

    return settled
  }
}
