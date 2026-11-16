import * as R from 'remeda'
import { sequential, sleep } from '@ontologyio/receta/async'
import { mapErr, type Result } from '@ontologyio/receta/result'

export type MapAtRateOptions = {
  /** At most this many calls start per second. */
  readonly perSecond: number
}

export type MapAtRateError = {
  readonly code: 'ITEM_FAILED'
  /** Which item failed. The items before it were all mapped. */
  readonly index: number
  readonly error: unknown
  readonly message: string
}

/**
 * Maps items with an async function one at a time, never faster than a number of calls per second.
 *
 * Use when: each item needs a call to an API with a strict rate limit, such as a geocoder
 * allowing 10 requests per second or a mail provider allowing 2, and going over the limit
 * gets the key blocked. Each call starts `1000 / perSecond` ms after the previous one
 * finished, so the rate is never exceeded even when calls are fast. It stops at the first
 * failure.
 *
 * @example
 * ```ts
 * const geocode = async (city: string) => `${city}: ok`
 *
 * await mapAtRate(['Lima', 'Oslo', 'Pune'], geocode, { perSecond: 500 })
 * // => Ok(['Lima: ok', 'Oslo: ok', 'Pune: ok'])
 *
 * const quotaHit = async (city: string) =>
 *   city === 'Oslo' ? Promise.reject('429') : `${city}: ok`
 *
 * await mapAtRate(['Lima', 'Oslo', 'Pune'], quotaHit, { perSecond: 500 })
 * // => Err({ code: 'ITEM_FAILED', index: 1, error: '429', message: 'Item 1 failed' })
 * ```
 *
 * @tags rate limit, throttle, pace, requests per second, quota, sequential, api
 * @see batchedWrite - sends items in groups, with a pause between groups
 * @see sequential - @ontologyio/receta/async, runs the calls in order and says which one failed
 */
export async function mapAtRate<T, U>(
  items: readonly T[],
  fn: (item: T, index: number) => Promise<U>,
  options: MapAtRateOptions,
): Promise<Result<U[], MapAtRateError>> {
  const gapMs = 1000 / options.perSecond
  const calls = R.map(items, (item, index) => async () => {
    if (index > 0) await sleep(gapMs)
    return fn(item, index)
  })
  return R.pipe(
    await sequential(calls),
    mapErr(({ taskIndex, error }): MapAtRateError => ({
      code: 'ITEM_FAILED',
      index: taskIndex,
      error,
      message: `Item ${taskIndex} failed`,
    })),
  )
}
