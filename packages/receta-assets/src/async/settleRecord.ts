import * as R from 'remeda'
import { promiseAllSettled, toResults } from '@ontologyio/receta/async'
import type { Result } from '@ontologyio/receta/result'

export type SettleRecordOutcome<Tasks extends Record<string, () => Promise<unknown>>> = {
  readonly [K in keyof Tasks]: Result<Awaited<ReturnType<Tasks[K]>>, unknown>
}

/**
 * Runs a record of async tasks at once and returns each one's Result under its own key.
 *
 * Use when: a page or a report loads several independent parts, such as a dashboard's
 * profile, feed and notifications, and each part should show its data or its own error
 * without the others failing with it. Nothing is thrown; each key holds `Ok(value)` or
 * `Err(reason)`, typed from its task.
 *
 * @example
 * ```ts
 * const dashboard = await settleRecord({
 *   profile: async () => ({ name: 'Ada' }),
 *   feed: async (): Promise<string[]> => Promise.reject('feed is down'),
 * })
 *
 * dashboard.profile
 * // => Ok({ name: 'Ada' })
 *
 * dashboard.feed
 * // => Err('feed is down')
 * ```
 *
 * @tags dashboard, allSettled, record, independent, widgets, partial failure, parallel
 * @see parallelRecord - fails as a whole when any task fails
 * @see promiseAllSettled - @ontologyio/receta/async, waits for every task
 * @see toResults - @ontologyio/receta/async, turns each settled promise into a Result
 */
export async function settleRecord<Tasks extends Record<string, () => Promise<unknown>>>(
  tasks: Tasks,
): Promise<SettleRecordOutcome<Tasks>> {
  const entries = R.entries(tasks)
  // An async wrapper turns a task that throws before returning a promise into a rejection.
  const settled = await promiseAllSettled(R.map(entries, async ([, task]) => task()))
  const keys: readonly string[] = R.map(entries, ([key]) => key)
  // R.fromEntries can't know each key keeps its own task's type, so the record is typed here.
  return R.fromEntries(R.zip(keys, toResults(settled))) as SettleRecordOutcome<Tasks>
}
