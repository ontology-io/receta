import * as R from 'remeda'

/**
 * Executes an array of async tasks sequentially (one at a time).
 *
 * Each task waits for the previous one to complete before starting.
 * Useful when tasks have dependencies or when you need strict ordering.
 *
 * @param tasks - Array of async functions to execute
 * @returns Promise resolving to array of results
 *
 * @example
 * ```typescript
 * // Execute tasks one at a time in order
 * const results = await sequential([
 *   () => createUser({ name: 'Alice' }),
 *   () => createPost({ title: 'Hello' }),
 *   () => publishPost({ id: 1 }),
 * ])
 *
 * // Database migrations that must run in order
 * await sequential([
 *   () => runMigration('001_create_users'),
 *   () => runMigration('002_add_email_index'),
 *   () => runMigration('003_create_posts'),
 * ])
 *
 * // Process items with side effects in order
 * const logs = await sequential(
 *   events.map(event => () => processEvent(event))
 * )
 * ```
 *
 * @see parallel - for running tasks in parallel with concurrency limit
 */
export async function sequential<T>(
  tasks: ReadonlyArray<() => Promise<T>>
): Promise<T[]> {
  // Use Remeda's reduce for a functional approach
  return R.reduce(
    tasks,
    async (accPromise, task) => {
      const acc = await accPromise
      const result = await task()
      return [...acc, result]
    },
    Promise.resolve([] as T[])
  )
}
