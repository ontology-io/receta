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
export type PushAtItem<S, P extends string> = NonNullable<ValueAt<S, P>> extends readonly (infer Item)[] ? Item : never

/**
 * Returns new state with an item added to the end of the array at a dot path, creating the array if missing.
 *
 * Use when: a reducer appends to a nested list, such as a message to `'chat.messages'`, a
 * toast to `'ui.toasts'` or a line to `'orders.0.lines'`. The path must lead to an array in
 * the state's type and the item must fit it, or the call doesn't compile. Objects off the
 * path are reused, and the input is never changed. Use `pushCappedAt` when the list must not
 * grow forever.
 *
 * @example
 * ```ts
 * const state = { chat: { messages: [{ id: 1, text: 'hi' }] }, ui: {} as { toasts?: string[] } }
 *
 * pushAt(state, 'chat.messages', { id: 2, text: 'hello' }).chat
 * // => { messages: [{ id: 1, text: 'hi' }, { id: 2, text: 'hello' }] }
 *
 * R.pipe(state, pushAt('ui.toasts', 'Saved')).ui
 * // => { toasts: ['Saved'] }
 * ```
 *
 * @tags push, append, add, array, list, immutable, reducer, nested, lens
 * @see pushCappedAt - appends and keeps only the newest items
 * @see toggleMembershipAt - adds a value only when it isn't there yet
 * @see over - @ontologyio/receta/lens, applies the append through the path lens
 */
export function pushAt<S, P extends string>(state: S, at: P, item: PushAtItem<S, P>): S
export function pushAt<S, P extends string>(at: P, item: PushAtItem<S, P>): (state: S) => S
export function pushAt(...args: unknown[]): unknown {
  return R.purry(pushAtImplementation, args)
}

const pushAtImplementation = <S>(state: S, at: string, item: unknown): S =>
  over(path<S, readonly unknown[] | undefined>(at), (list = []) => [...list, item], state)
