import * as R from 'remeda'
import { ok, err, type Result, orThrow } from '../../result'

/**
 * Error type for sequential task execution failures.
 */
export interface SequentialError {
  readonly type: 'sequential_error'
  readonly taskIndex: number
  readonly completedTasks: number
  readonly error: unknown
}

/**
 * Executes an array of async tasks sequentially (one at a time).
 *
 * Returns a Result to handle errors explicitly. If any task fails,
 * execution stops and returns an Err with details about which task failed.
 *
 * Each task waits for the previous one to complete before starting.
 * Useful when tasks have dependencies or when you need strict ordering.
 *
 * @param tasks - Array of async functions to execute
 * @returns Promise resolving to Result containing array of results or error
 *
 * @example
 * ```typescript
 * import * as R from 'remeda'
 * import { unwrapOr, mapErr } from 'receta/result'
 *
 * // Execute tasks one at a time in order
 * const result = await sequential([
 *   () => createUser({ name: 'Alice' }),
 *   () => createPost({ title: 'Hello' }),
 *   () => publishPost({ id: 1 }),
 * ])
 *
 * // Handle with Result pattern
 * const results = R.pipe(
 *   result,
 *   mapErr(error => console.error('Task failed at index:', error.taskIndex)),
 *   unwrapOr([])
 * )
 *
 * // Database migrations that must run in order
 * const migrationResult = await sequential([
 *   () => runMigration('001_create_users'),
 *   () => runMigration('002_add_email_index'),
 *   () => runMigration('003_create_posts'),
 * ])
 *
 * if (isErr(migrationResult)) {
 *   console.error('Migration failed:', migrationResult.error)
 *   // Can rollback completed migrations using completedTasks count
 * }
 *
 * // Process items with side effects in order
 * const logs = await sequential(
 *   events.map(event => () => processEvent(event))
 * )
 * ```
 *
 * @see parallel - for running tasks in parallel with concurrency limit
 * @see sequentialOrThrow - throwing variant for backward compatibility
 */
export async function sequential<T>(
  tasks: ReadonlyArray<() => Promise<T>>
): Promise<Result<T[], SequentialError>> {
  const results: T[] = []

  for (const [index, task] of tasks.entries()) {
    try {
      const result = await task()
      results.push(result)
    } catch (error) {
      return err({
        type: 'sequential_error' as const,
        taskIndex: index,
        completedTasks: results.length,
        error,
      })
    }
  }

  return ok(results)
}

/**
 * Throwing variant of sequential for backward compatibility.
 *
 * Use this when you want exceptions instead of Result pattern.
 * Prefer the Result-returning sequential for better error handling.
 *
 * @param tasks - Array of async functions to execute
 * @returns Promise resolving to array of results
 * @throws SequentialError if any task fails
 *
 * @example
 * ```typescript
 * // Throws on error
 * try {
 *   const results = await sequentialOrThrow([
 *     () => createUser({ name: 'Alice' }),
 *     () => createPost({ title: 'Hello' }),
 *     () => publishPost({ id: 1 }),
 *   ])
 * } catch (error) {
 *   console.error('Task failed:', error)
 * }
 * ```
 *
 * @see sequential - Result-returning variant (recommended)
 * @see orThrow - utility for creating throwing variants
 */
export const sequentialOrThrow = orThrow(sequential)
