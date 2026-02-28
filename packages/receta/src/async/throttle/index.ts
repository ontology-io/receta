import type { ThrottleOptions } from '../types'

/**
 * Throttles an async function.
 *
 * Creates a throttled version of an async function that only invokes
 * at most once per specified delay period.
 *
 * Unlike debounce (which delays execution until calls stop), throttle
 * guarantees execution at regular intervals regardless of call frequency.
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
 * trackEvent('scroll') // Ignored (within 1s)
 * trackEvent('scroll') // Ignored (within 1s)
 * // ... 1 second passes
 * trackEvent('scroll') // Executes
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

  let lastExecution = 0
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
      const remainingTime = Math.max(0, delay - timeSinceLastExecution)

      lastPromise = new Promise<TReturn>((resolve, reject) => {
        timeoutId = setTimeout(async () => {
          timeoutId = undefined
          lastExecution = Date.now()
          try {
            const result = await fn(...lastArgs!)
            resolve(result)
          } catch (error) {
            reject(error)
          }
        }, remainingTime)
      })
    }

    // Return the last promise or create a new one
    return lastPromise || Promise.resolve(fn(...args))
  }
}
