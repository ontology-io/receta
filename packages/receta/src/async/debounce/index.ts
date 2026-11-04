import type { DebounceOptions } from '../types'

/**
 * Debounces an async function.
 *
 * Creates a debounced version of an async function that delays invoking
 * until after the specified delay has elapsed since the last call.
 *
 * Useful for rate-limiting API calls, search inputs, or any operation
 * that shouldn't run on every invocation.
 *
 * The promise of a call that a newer call replaces never settles. With
 * `trailing: false`, neither does the promise of a call ignored during the delay.
 * There is no `cancel` or `flush`.
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
 * searchAPI('h')      // Replaced, its promise never settles
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

  const debounced = (...args: TArgs): Promise<TReturn> => {
    const now = Date.now()
    const timeSinceLastInvocation = now - lastInvocation

    if (timeoutId !== undefined) {
      clearTimeout(timeoutId)
      timeoutId = undefined
    }

    return new Promise<TReturn>((resolve, reject) => {
      const execute = (): void => {
        fn(...args)
          .then(resolve)
          .catch(reject)
      }

      const shouldExecuteLeading = leading && timeSinceLastInvocation >= delay
      if (shouldExecuteLeading) {
        lastInvocation = now
        execute()
        return
      }

      if (trailing) {
        timeoutId = setTimeout(() => {
          lastInvocation = Date.now()
          timeoutId = undefined
          execute()
        }, delay)
      }
    })
  }

  return debounced
}
