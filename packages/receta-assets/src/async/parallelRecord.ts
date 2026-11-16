import * as R from 'remeda'
import { mapAsync } from '@ontologyio/receta/async'
import { map, mapErr, type Result } from '@ontologyio/receta/result'

export type ParallelRecordValues<Tasks extends Record<string, () => Promise<unknown>>> = {
  readonly [K in keyof Tasks]: Awaited<ReturnType<Tasks[K]>>
}

export type ParallelRecordError = {
  readonly code: 'TASK_FAILED'
  /** The key of the task that failed. */
  readonly key: string
  readonly error: unknown
  readonly message: string
}

export type ParallelRecordOptions = {
  /** How many tasks run at once. Defaults to all of them. */
  readonly concurrency?: number
}

/**
 * Runs a record of async tasks in parallel and returns a record of their values, or the first task that failed.
 *
 * Use when: a handler needs several unrelated things before it can answer, such as the user,
 * their settings and their permissions, and any one of them missing means the request
 * fails. Each value keeps its own type under its key, unlike a tuple from `parallel`, and
 * the error names the key that failed.
 *
 * @example
 * ```ts
 * await parallelRecord({
 *   user: async () => ({ id: 7 }),
 *   settings: async () => ({ theme: 'dark' }),
 * })
 * // => Ok({ user: { id: 7 }, settings: { theme: 'dark' } })
 *
 * await parallelRecord({
 *   user: async () => ({ id: 7 }),
 *   settings: async () => Promise.reject('timeout'),
 * })
 * // => Err({ code: 'TASK_FAILED', key: 'settings', error: 'timeout', message: 'Task "settings" failed' })
 * ```
 *
 * @tags parallel, record, load, concurrent, fan out, request handler, typed
 * @see settleRecord - keeps every task's Result instead of failing as a whole
 * @see mapAsync - @ontologyio/receta/async, runs the tasks with a concurrency limit
 */
export async function parallelRecord<Tasks extends Record<string, () => Promise<unknown>>>(
  tasks: Tasks,
  options: ParallelRecordOptions = {},
): Promise<Result<ParallelRecordValues<Tasks>, ParallelRecordError>> {
  const entries = R.entries(tasks)
  const keys = R.map(entries, ([key]) => key)
  return R.pipe(
    await mapAsync(entries, async ([, task]) => task(), options),
    // R.fromEntries can't know each key keeps its own task's type, so the record is typed here.
    map((values) => R.fromEntries(R.zip(keys, values)) as ParallelRecordValues<Tasks>),
    mapErr(({ index, error }): ParallelRecordError => {
      const key = keys[index] ?? String(index)
      return { code: 'TASK_FAILED', key, error, message: `Task "${key}" failed` }
    }),
  )
}
