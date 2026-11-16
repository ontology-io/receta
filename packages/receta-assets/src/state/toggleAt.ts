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

/** `P` when it is a dot path to a boolean inside `S`, otherwise `never`, so the call doesn't compile. */
export type ToggleAtPath<S, P extends string> = [ValueAt<S, P>] extends [never]
  ? never
  : ValueAt<S, P> extends boolean | undefined
    ? P
    : never

/**
 * Returns new state with the boolean at a dot path flipped, where a missing flag counts as false.
 *
 * Use when: a click flips one nested flag, such as a modal's `open`, a sidebar's
 * `collapsed`, a todo's `done` (`'todos.3.done'`) or an optional `'flags.beta'` that may not
 * be set yet. The path must lead to a boolean in the state's type, or the call doesn't
 * compile. Objects off the path are reused, and the input is never changed.
 *
 * @example
 * ```ts
 * const state = { ui: { sidebar: { open: true } }, todos: [{ title: 'Write', done: false }], flags: {} as { beta?: boolean } }
 *
 * toggleAt(state, 'ui.sidebar.open').ui
 * // => { sidebar: { open: false } }
 *
 * R.pipe(state, toggleAt('todos.0.done')).todos
 * // => [{ title: 'Write', done: true }]
 *
 * toggleAt(state, 'flags.beta').flags
 * // => { beta: true }
 * ```
 *
 * @tags toggle, boolean, flag, switch, checkbox, open, collapse, immutable, reducer, lens
 * @see toggleById - flips a flag on the item with an id
 * @see over - @ontologyio/receta/lens, applies the flip through the path lens
 */
export function toggleAt<S, P extends string>(state: S, at: ToggleAtPath<S, P>): S
export function toggleAt<S, P extends string>(at: ToggleAtPath<S, P>): (state: S) => S
export function toggleAt(...args: unknown[]): unknown {
  return R.purry(toggleAtImplementation, args)
}

const toggleAtImplementation = <S>(state: S, at: string): S =>
  over(path<S, boolean | undefined>(at), (flag) => flag !== true, state)
