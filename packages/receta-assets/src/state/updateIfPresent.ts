import * as R from 'remeda'
import { optional, path, set, view } from '@ontologyio/receta/lens'
import { match } from '@ontologyio/receta/option'

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

/** The value at dot path `P` inside `S`, without `null` and `undefined`: what `update` receives. */
export type UpdateIfPresentValue<S, P extends string> = NonNullable<ValueAt<S, P>>

/** `P` when it is a dot path inside `S`, otherwise `never`, so the call doesn't compile. */
export type UpdateIfPresentPath<S, P extends string> = [ValueAt<S, P>] extends [never] ? never : P

/**
 * Returns new state with `update` applied to the value at a dot path, or the same state when that value is missing.
 *
 * Use when: an event refers to something that may already be gone, such as a websocket update
 * for a closed chat, a late response for a removed row, or `'selected.details'` after the
 * selection was cleared. A plain update would create the path and call `update(undefined)`;
 * here `null` and `undefined` mean "nothing to do", the same state object comes back, and
 * `update` never sees a missing value.
 *
 * @example
 * ```ts
 * const state = { chats: { c1: { unread: 2 } } as Record<string, { unread: number }>, selected: null as { title: string } | null }
 *
 * updateIfPresent(state, 'chats.c1', (chat) => ({ ...chat, unread: 0 })).chats
 * // => { c1: { unread: 0 } }
 *
 * R.pipe(state, updateIfPresent('chats.gone', (chat) => ({ ...chat, unread: 0 }))) === state
 * // => true
 *
 * updateIfPresent(state, 'selected', (selected) => ({ title: selected.title.toUpperCase() })) === state
 * // => true
 * ```
 *
 * @tags update, optional, if exists, maybe, nullable, safe, guard, missing, stale, lens
 * @see setAt - writes the value even when the path is missing
 * @see optional - @ontologyio/receta/lens, reads the value as an Option
 * @see match - @ontologyio/receta/option, updates on Some and keeps the state on None
 */
export function updateIfPresent<S, P extends string>(
  state: S,
  at: UpdateIfPresentPath<S, P>,
  update: (value: UpdateIfPresentValue<S, P>) => UpdateIfPresentValue<S, P>,
): S
export function updateIfPresent<S, P extends string>(
  at: UpdateIfPresentPath<S, P>,
  update: (value: UpdateIfPresentValue<S, P>) => UpdateIfPresentValue<S, P>,
): (state: S) => S
export function updateIfPresent(...args: unknown[]): unknown {
  return R.purry(updateIfPresentImplementation, args)
}

const updateIfPresentImplementation = <S>(state: S, at: string, update: (value: unknown) => unknown): S => {
  const valueLens = path<S, unknown>(at)
  return R.pipe(
    view(optional(valueLens), state),
    match({ onSome: (value) => set(valueLens, update(value), state), onNone: () => state }),
  )
}
