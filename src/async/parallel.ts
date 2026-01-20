import type { ConcurrencyOptions } from './types'
import { mapAsync } from './mapAsync'

/**
 * Executes an array of async tasks in parallel with optional concurrency limit.
 *
 * Similar to Promise.all but with concurrency control. Useful when you have
 * a list of async operations and want to limit how many run simultaneously.
 *
 * @param tasks - Array of async functions to execute
 * @param options - Concurrency options
 * @returns Promise resolving to array of results
 *
 * @example
 * ```typescript
 * // Execute all tasks with concurrency limit of 3
 * const results = await parallel(
 *   [
 *     () => fetch('/api/users/1'),
 *     () => fetch('/api/users/2'),
 *     () => fetch('/api/users/3'),
 *     () => fetch('/api/users/4'),
 *     () => fetch('/api/users/5'),
 *   ],
 *   { concurrency: 3 }
 * )
 *
 * // Unlimited concurrency (same as Promise.all)
 * const all = await parallel([
 *   () => fetchUser(1),
 *   () => fetchPosts(),
 *   () => fetchComments(),
 * ])
 *
 * // Generate tasks dynamically
 * const userIds = [1, 2, 3, 4, 5]
 * const fetchTasks = userIds.map(id => () => fetchUser(id))
 * const users = await parallel(fetchTasks, { concurrency: 2 })
 * ```
 *
 * @see sequential - for running tasks one at a time
 * @see mapAsync - for mapping over data with concurrency
 */
export async function parallel<T>(
  tasks: ReadonlyArray<() => Promise<T>>,
  options?: ConcurrencyOptions
): Promise<T[]> {
  return mapAsync(tasks, (task) => task(), options)
}
