import * as R from 'remeda'
import { none, some, type Option } from '@ontologyio/receta/option'
import { isErr, ok, tryCatchAsync, type Result } from '@ontologyio/receta/result'

export type FindAsyncError = {
  readonly code: 'CHECK_FAILED'
  /** Which item's check failed. */
  readonly index: number
  readonly error: unknown
  readonly message: string
}

/**
 * Checks items one at a time with an async check and returns the first that passes, without checking the rest.
 *
 * Use when: each check costs a call and the first match is enough, such as the first free
 * username among candidates, the first healthy endpoint, or the first file that exists.
 * Checks run in order and stop at the first match: `Ok(Some(item))`. No match is
 * `Ok(None)`; a check that throws is an Err, since the answer is then unknown.
 *
 * @example
 * ```ts
 * const taken = ['ada', 'ada1']
 * let checks = 0
 * const isFree = async (name: string) => {
 *   checks += 1
 *   return !taken.includes(name)
 * }
 *
 * await findAsync(['ada', 'ada1', 'ada2', 'ada3'], isFree)
 * // => Ok(Some('ada2'))
 *
 * checks
 * // => 3
 *
 * await findAsync(['ada', 'ada1'], isFree)
 * // => Ok(None)
 *
 * const flaky = async (name: string) => (name === 'ada1' ? Promise.reject('timeout') : false)
 * await findAsync(['ada', 'ada1', 'ada2'], flaky)
 * // => Err({ code: 'CHECK_FAILED', index: 1, error: 'timeout', message: 'The check for item 1 failed' })
 * ```
 *
 * @tags find, first, async predicate, search, sequential, short circuit, lookup
 * @see partitionAsync - checks every item and keeps both groups
 * @see tryInOrder - the first task that succeeds, instead of the first item that passes
 */
export async function findAsync<T>(
  items: readonly T[],
  check: (item: T, index: number) => Promise<boolean>,
): Promise<Result<Option<T>, FindAsyncError>> {
  const findFrom = async (remaining: readonly T[], index: number): Promise<Result<Option<T>, FindAsyncError>> => {
    if (!R.hasAtLeast(remaining, 1)) return ok(none())
    const [item, ...rest] = remaining
    const checked = await tryCatchAsync(
      () => check(item, index),
      (error): FindAsyncError => ({ code: 'CHECK_FAILED', index, error, message: `The check for item ${index} failed` }),
    )
    if (isErr(checked)) return checked
    return checked.value ? ok(some(item)) : findFrom(rest, index + 1)
  }
  return findFrom(items, 0)
}
