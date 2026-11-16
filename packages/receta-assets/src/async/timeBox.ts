import { timeout } from '@ontologyio/receta/async'
import { fromResult, type Option } from '@ontologyio/receta/option'
import { flatten, tryCatchAsync } from '@ontologyio/receta/result'

/**
 * Gives an async task a time limit, and returns None when it runs past the limit or fails.
 *
 * Use when: the value is an optional extra, such as recommendations, a weather badge or a
 * link preview, and the page should go ahead without it instead of waiting or showing an
 * error. The task keeps running after the limit, because a promise can't be cancelled; its
 * result is ignored. Use `withTimeLimit` when the caller needs to know what went wrong.
 *
 * @example
 * ```ts
 * import { sleep } from '@ontologyio/receta/async'
 *
 * await timeBox(async () => ['socks', 'hat'], 20)
 * // => Some(['socks', 'hat'])
 *
 * const slowRecommendations = async () => {
 *   await sleep(40)
 *   return ['socks']
 * }
 * await timeBox(slowRecommendations, 10)
 * // => None
 *
 * const broken = async (): Promise<string[]> => {
 *   throw new Error('500')
 * }
 * await timeBox(broken, 20)
 * // => None
 * ```
 *
 * @tags timeout, time limit, optional, budget, deadline, enrichment, best effort
 * @see withTimeLimit - the same limit, with a Result that says whether it timed out or failed
 * @see timeout - @ontologyio/receta/async, the race against the clock
 */
export async function timeBox<T>(task: () => Promise<T>, limitMs: number): Promise<Option<T>> {
  // timeout rethrows a rejection, so tryCatchAsync turns it into an Err as well.
  const outcome = await tryCatchAsync(() => timeout(task(), limitMs))
  return fromResult(flatten(outcome))
}
