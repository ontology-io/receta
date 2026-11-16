import * as R from 'remeda'
import { prop, set } from '@ontologyio/receta/lens'
import { none, some, type Option } from '@ontologyio/receta/option'

/** The state of one remote request: where it is, the last data it got, the last error. */
export type ReduceRequestState<T, E> = {
  readonly status: 'idle' | 'loading' | 'success' | 'error'
  readonly data: Option<T>
  readonly error: Option<E>
}

/** What happened to the request. */
export type ReduceRequestEvent<T, E> =
  | { readonly type: 'start' }
  | { readonly type: 'success'; readonly data: T }
  | { readonly type: 'failure'; readonly error: E }
  | { readonly type: 'reset' }

/**
 * Moves a remote-data state (idle, loading, success, error) on by one event, keeping the last data while it reloads.
 *
 * Use when: a reducer, store or hook tracks a fetch by hand and the screen must show stale data
 * with a spinner during a refresh, and keep it with an error banner when the refresh fails.
 * `start` clears the error but keeps the data, `success` stores the new data, `failure`
 * stores the error and keeps the data, and `reset` goes back to idle with nothing. A first
 * load and a refresh both say `loading`: `isSome(state.data)` tells them apart.
 *
 * ```text
 *  EVENT      STATUS AFTER   DATA AFTER          ERROR AFTER
 *  ─────────  ─────────────  ──────────────────  ──────────────────
 *  start      loading        kept                None
 *  success    success        Some(event.data)    None
 *  failure    error          kept                Some(event.error)
 *  reset      idle           None                None
 * ```
 *
 * @example
 * ```ts
 * import { none } from '@ontologyio/receta/option'
 *
 * const idle = { status: 'idle' as const, data: none(), error: none() }
 *
 * const loaded = R.pipe(
 *   idle,
 *   reduceRequest<string[], string>({ type: 'start' }),
 *   reduceRequest({ type: 'success', data: ['ada'] }),
 * )
 * // => { status: 'success', data: Some(['ada']), error: None }
 *
 * const failedRefresh = R.pipe(
 *   loaded,
 *   reduceRequest<string[], string>({ type: 'start' }),
 *   reduceRequest({ type: 'failure', error: 'Offline' }),
 * )
 * // => { status: 'error', data: Some(['ada']), error: Some('Offline') }
 *
 * reduceRequest(failedRefresh, { type: 'reset' })
 * // => { status: 'idle', data: None, error: None }
 * ```
 *
 * @tags fetch, request, loading, async state, remote data, reducer, stale while revalidate, status, lens
 * @see set - @ontologyio/receta/lens, writes status, data and error
 * @see some - @ontologyio/receta/option, the data and error slots
 */
export function reduceRequest<T, E>(state: ReduceRequestState<T, E>, event: ReduceRequestEvent<T, E>): ReduceRequestState<T, E>
export function reduceRequest<T, E>(event: ReduceRequestEvent<T, E>): (state: ReduceRequestState<T, E>) => ReduceRequestState<T, E>
export function reduceRequest(...args: unknown[]): unknown {
  return R.purry(reduceRequestImplementation, args)
}

const reduceRequestImplementation = <T, E>(
  state: ReduceRequestState<T, E>,
  event: ReduceRequestEvent<T, E>,
): ReduceRequestState<T, E> => {
  const status = prop<ReduceRequestState<T, E>, 'status'>('status')
  const data = prop<ReduceRequestState<T, E>, 'data'>('data')
  const error = prop<ReduceRequestState<T, E>, 'error'>('error')
  switch (event.type) {
    case 'start':
      return R.pipe(state, set(status, 'loading'), set(error, none()))
    case 'success':
      return R.pipe(state, set(status, 'success'), set(data, some(event.data)), set(error, none()))
    case 'failure':
      return R.pipe(state, set(status, 'error'), set(error, some(event.error)))
    case 'reset':
      return R.pipe(state, set(status, 'idle'), set(data, none()), set(error, none()))
  }
}
