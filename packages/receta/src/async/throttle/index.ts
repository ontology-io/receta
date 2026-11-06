import type { ThrottleOptions } from '../types'
import { match, tryCatchAsync } from '../../result'
import { rejectQuietly } from '../../utils/rejectQuietly'

const NOTHING_CAN_RUN = 'throttle: leading and trailing are both false, so fn never runs'

/**
 * Throttles an async function.
 *
 * Creates a throttled version of an async function that only invokes
 * at most once per specified delay period.
 *
 * Unlike debounce (which delays execution until calls stop), throttle
 * guarantees execution at regular intervals regardless of call frequency.
 *
 * Calls made during the delay share one promise for the next trailing run, which
 * uses the latest arguments. With `leading: false`, a call after a quiet spell waits
 * out a whole delay too. If `leading` and `trailing` are both false, nothing can run,
 * so every call rejects. There is no `cancel` or `flush`.
 *
 * @param fn - Async function to throttle
 * @param options - Throttle options
 * @returns Throttled function
 *
 * @example
 * ```typescript
 * // Throttled API call (max once per second)
 * const trackEvent = throttle(
 *   async (event: string) => {
 *     await fetch('/api/analytics', {
 *       method: 'POST',
 *       body: JSON.stringify({ event })
 *     })
 *   },
 *   { delay: 1000 }
 * )
 *
 * // User scrolls rapidly
 * trackEvent('scroll') // Executes immediately
 * trackEvent('scroll') // Waits for the trailing run
 * trackEvent('scroll') // Shares that run, which uses the latest arguments
 * // ... 1 second passes, and the trailing run executes
 *
 * // Throttle with trailing edge only
 * const saveProgress = throttle(
 *   async (data) => api.save(data),
 *   { delay: 5000, leading: false, trailing: true }
 * )
 * ```
 *
 * @see debounce - for delaying execution until calls stop
 */
export function throttle<TArgs extends readonly unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  options: ThrottleOptions
): (...args: TArgs) => Promise<TReturn> {
  const { delay, leading = true, trailing = true } = options

  let lastExecution = -Infinity
  let timeoutId: ReturnType<typeof setTimeout> | undefined
  let lastArgs: TArgs | undefined
  let lastPromise: Promise<TReturn> | undefined

  return function throttled(...args: TArgs): Promise<TReturn> {
    const now = Date.now()
    const timeSinceLastExecution = now - lastExecution

    // Store latest arguments for trailing edge
    lastArgs = args

    // Leading edge execution
    if (leading && timeSinceLastExecution >= delay) {
      lastExecution = now
      lastPromise = fn(...args)
      return lastPromise
    }

    // Trailing edge execution
    if (trailing && !timeoutId) {
      // A call after a quiet spell opens a new delay, and any other waits out the current one
      const remainingTime = timeSinceLastExecution >= delay ? delay : delay - timeSinceLastExecution

      lastPromise = new Promise<TReturn>((resolve, reject) => {
        timeoutId = setTimeout(async () => {
          timeoutId = undefined
          lastExecution = Date.now()
          match(await tryCatchAsync(() => fn(...lastArgs!)), { onOk: resolve, onErr: reject })
        }, remainingTime)
      })
    }

    // Either edge has made a promise by now, so only both edges off leaves none
    return lastPromise ?? rejectQuietly(NOTHING_CAN_RUN)
  }
}
