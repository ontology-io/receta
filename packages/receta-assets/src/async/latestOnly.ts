import { none, some, type Option } from '@ontologyio/receta/option'
import { tryCatchAsync, type Result } from '@ontologyio/receta/result'

/**
 * Wraps an async function so only the newest call's answer is kept, and older calls that finish later come back as None.
 *
 * Use when: requests can come back out of order and only the latest matters, such as
 * search-as-you-type, a filter panel or switching tabs, where a slow answer for `"a"` must
 * not replace the answer for `"ab"`. Every call still runs; an older call resolves to
 * `None` once a newer one has started, so the caller just ignores it. The newest call's
 * outcome comes back as `Some(Ok(value))` or `Some(Err(error))`.
 *
 * @example
 * ```ts
 * import { sleep } from '@ontologyio/receta/async'
 *
 * const search = async (query: string) => {
 *   await sleep(query.length === 1 ? 20 : 2)
 *   return `results for ${query}`
 * }
 * const searchLatest = latestOnly(search)
 *
 * const typedA = searchLatest('a')
 * const typedAb = searchLatest('ab')
 *
 * await typedAb
 * // => Some(Ok('results for ab'))
 *
 * await typedA
 * // => None
 * ```
 *
 * @tags latest, stale response, race condition, search as you type, switchMap, cancel, out of order
 * @see autosave - waits for a pause and runs only the last call
 * @see tryCatchAsync - @ontologyio/receta/result, keeps the newest call's failure as an Err
 */
export function latestOnly<A, T>(task: (input: A) => Promise<T>): (input: A) => Promise<Option<Result<T, unknown>>> {
  let latestCall = 0
  return async (input) => {
    latestCall += 1
    const call = latestCall
    const outcome = await tryCatchAsync(() => task(input))
    return call === latestCall ? some(outcome) : none()
  }
}
