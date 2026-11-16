import * as R from 'remeda'
import { over, path } from '@ontologyio/receta/lens'

type Step<T, K extends string> = T extends readonly (infer Item)[]
  ? K extends `${number}`
    ? Item
    : never
  : K extends keyof T
    ? T[K]
    : never

type ValueAt<S, P extends string> = P extends `${infer Head}.${infer Rest}`
  ? ValueAt<NonNullable<Step<NonNullable<S>, Head>>, Rest>
  : Step<NonNullable<S>, P>

/** The item type of the array at dot path `P` inside `S`, or `never` when no array is there. */
export type PushCappedAtItem<S, P extends string> = NonNullable<ValueAt<S, P>> extends readonly (infer Item)[]
  ? Item
  : never

/**
 * Returns new state with an item appended to the array at a dot path, dropping the oldest items beyond a limit.
 *
 * Use when: a list in state must stay bounded, such as recent searches, the last 50 log lines,
 * notifications, chat history kept in memory or an activity feed. The newest item goes last,
 * and only the last `max` items are kept, so the oldest go first. A missing array starts
 * empty. The path must lead to an array in the state's type and the item must fit it.
 *
 * @example
 * ```ts
 * const state = { search: { recent: ['shoes', 'socks', 'hats'] } }
 *
 * pushCappedAt(state, 'search.recent', 'gloves', 3).search
 * // => { recent: ['socks', 'hats', 'gloves'] }
 *
 * R.pipe(state, pushCappedAt('search.recent', 'scarf', 10)).search
 * // => { recent: ['shoes', 'socks', 'hats', 'scarf'] }
 * ```
 *
 * @tags push, cap, limit, bounded, recent, history, log, ring buffer, notifications, lens
 * @see pushAt - appends without a limit
 * @see historyPush - an undo history with a limit
 * @see over - @ontologyio/receta/lens, applies the append through the path lens
 */
export function pushCappedAt<S, P extends string>(state: S, at: P, item: PushCappedAtItem<S, P>, max: number): S
export function pushCappedAt<S, P extends string>(at: P, item: PushCappedAtItem<S, P>, max: number): (state: S) => S
export function pushCappedAt(...args: unknown[]): unknown {
  return R.purry(pushCappedAtImplementation, args)
}

const pushCappedAtImplementation = <S>(state: S, at: string, item: unknown, max: number): S =>
  over(path<S, readonly unknown[] | undefined>(at), (list = []) => R.takeLast([...list, item], max), state)
