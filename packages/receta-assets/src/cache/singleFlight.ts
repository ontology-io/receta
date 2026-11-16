import { memoizeAsync, type MemoizedAsyncFunction } from '@ontologyio/receta/memo'

export type SingleFlightOptions<A extends readonly unknown[]> = {
  /** Which calls count as the same request. Defaults to the first argument. */
  readonly key?: (...args: A) => unknown
}

/**
 * Wraps an async loader so calls with the same key made while one is running share it, and nothing is kept once it settles.
 *
 * Use when: many callers ask for the same thing at the same moment, such as every request
 * on a cold start reading one config row, or a burst of renders fetching one profile, but
 * the answer must be fresh on the next call. `memoizeAsync` keeps the answer; this keeps
 * it only while the request is in flight, so it removes duplicate requests without ever
 * serving stale data. A rejection reaches every caller that shared it.
 *
 * @example
 * ```ts
 * import { mapAsync, sleep } from '@ontologyio/receta/async'
 *
 * let requests = 0
 * const fetchProfile = async (id: string) => {
 *   requests += 1
 *   await sleep(2)
 *   return `${id} from request ${requests}`
 * }
 * const getProfile = singleFlight(fetchProfile)
 *
 * await mapAsync(['u1', 'u1', 'u1'], getProfile)
 * // => Ok(['u1 from request 1', 'u1 from request 1', 'u1 from request 1'])
 *
 * await getProfile('u1')
 * // => 'u1 from request 2'
 * ```
 *
 * @tags dedupe, single flight, coalesce, in flight, thundering herd, concurrent, request collapsing
 * @see memoizeAsync - @ontologyio/receta/memo, also shares in-flight calls, and keeps the answer
 * @see loadOnce - shares one load and keeps it until reset
 */
export function singleFlight<A extends readonly unknown[], T>(
  load: (...args: A) => Promise<T>,
  options: SingleFlightOptions<A> = {},
): (...args: A) => Promise<T> {
  const keyOf = options.key ?? ((...args: A) => args[0])
  const shared: MemoizedAsyncFunction<A, T> = memoizeAsync(
    // Once the shared call settles, its entry goes, so the next call starts a new one.
    (...args: A) => load(...args).finally(() => shared.cache.delete(keyOf(...args))),
    { keyFn: keyOf },
  )
  return shared
}
