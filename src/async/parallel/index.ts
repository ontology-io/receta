import type { ConcurrencyOptions } from '../types'
import { mapAsync, type MapAsyncError } from '../mapAsync'
import { type Result, orThrow } from '../../result'

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
): Promise<Result<T[], MapAsyncError>> {
  return mapAsync(tasks, (task) => task(), options)
}

/**
 * Throwing variant of parallel for backward compatibility.
 *
 * Use this when you want exceptions instead of Result pattern.
 * Prefer the Result-returning parallel for better error handling.
 *
 * This is implemented using the `orThrow` utility from Result module,
 * which converts any Result-returning function to a throwing variant.
 *
 * @param tasks - Array of async functions to execute
 * @param options - Concurrency options
 * @returns Promise resolving to array of results
 * @throws Error if any task fails
 *
 * @example
 * ```typescript
 * // Equivalent to using orThrow directly
 * const parallelOrThrow = orThrow(parallel)
 * ```
 *
 * @see parallel - Result-returning variant (recommended)
 * @see orThrow - utility for creating throwing variants
 */
export const parallelOrThrow = orThrow(parallel)
