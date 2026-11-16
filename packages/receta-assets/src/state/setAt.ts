import * as R from 'remeda'
import { path, set } from '@ontologyio/receta/lens'

type Step<T, K extends string> = T extends readonly (infer Item)[]
  ? K extends `${number}`
    ? Item
    : never
  : K extends keyof T
    ? T[K]
    : never

/** The type at a dot path such as `'user.tags.0'` inside `S`, or `never` when nothing is there. */
export type SetAtValue<S, P extends string> = P extends `${infer Head}.${infer Rest}`
  ? SetAtValue<NonNullable<Step<NonNullable<S>, Head>>, Rest>
  : Step<NonNullable<S>, P>

/**
 * Returns new state with one value replaced at a dot path, copying only the objects on the way to it.
 *
 * Use when: a reducer, a `setState` callback or a store update must change one nested field,
 * such as `'settings.theme'` or `'todos.2.title'`, without spreading every level by hand.
 * The path is checked against the state's type, and so is the value. Numeric parts index
 * into arrays. Objects off the path are reused, so memoized components that read them don't
 * re-render. A missing object on the way is created as `{}`. The input is never changed.
 *
 * @example
 * ```ts
 * const state = { user: { name: 'Ada', tags: ['math', 'poetry'] }, settings: { theme: 'light' } }
 *
 * setAt(state, 'user.tags.1', 'logic')
 * // => { user: { name: 'Ada', tags: ['math', 'logic'] }, settings: { theme: 'light' } }
 *
 * const next = R.pipe(state, setAt('settings.theme', 'dark'))
 * next.settings
 * // => { theme: 'dark' }
 *
 * next.user === state.user
 * // => true
 * ```
 *
 * @tags set, update, immutable, nested, path, reducer, setState, redux, zustand, lens
 * @see setManyAt - several paths in one update
 * @see path - @ontologyio/receta/lens, the lens the path becomes
 * @see set - @ontologyio/receta/lens, the write through it
 */
export function setAt<S, P extends string>(state: S, at: P, value: SetAtValue<S, P>): S
export function setAt<S, P extends string>(at: P, value: SetAtValue<S, P>): (state: S) => S
export function setAt(...args: unknown[]): unknown {
  return R.purry(setAtImplementation, args)
}

const setAtImplementation = <S>(state: S, at: string, value: unknown): S => set(path<S, unknown>(at), value, state)
