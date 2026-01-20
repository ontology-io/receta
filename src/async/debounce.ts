import type { DebounceOptions } from './types'

/**
 * Debounces an async function.
 *
 * Creates a debounced version of an async function that delays invoking
 * until after the specified delay has elapsed since the last call.
 *
 * Useful for rate-limiting API calls, search inputs, or any operation
 * that shouldn't run on every invocation.
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
 * searchAPI('h')      // Cancelled
 * searchAPI('he')     // Cancelled
 * searchAPI('hel')    // Cancelled
 * searchAPI('hell')   // Cancelled
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

  return function debounced(...args: TArgs): Promise<TReturn> {
    const now = Date.now()
    const timeSinceLastInvocation = now - lastInvocation

    // Clear existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    // Create new promise for this debounced call
    return new Promise<TReturn>((resolve, reject) => {
      const execute = async () => {
        try {
          const result = await fn(...args)
          resolve(result)
        } catch (error) {
          reject(error)
        }
      }

      // Leading edge execution
      if (leading && timeSinceLastInvocation >= delay) {
        lastInvocation = now
        execute()
        return
      }

      // Trailing edge execution
      if (trailing) {
        timeoutId = setTimeout(() => {
          lastInvocation = Date.now()
          execute()
        }, delay)
      }
    })
  }
}
