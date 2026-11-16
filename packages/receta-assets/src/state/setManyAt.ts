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
export type SetManyAtValue<S, P extends string> = P extends `${infer Head}.${infer Rest}`
  ? SetManyAtValue<NonNullable<Step<NonNullable<S>, Head>>, Rest>
  : Step<NonNullable<S>, P>

/** A record of dot paths to values, each value checked against the type at its path. */
export type SetManyAtUpdates<S, U> = U & { readonly [P in keyof U & string]: SetManyAtValue<S, P> }

/**
 * Returns new state with a value written at each dot path of a record, as one update.
 *
 * Use when: one event changes fields in several places, such as a login response filling
 * `'session.user'` and `'session.token'` and clearing `'ui.error'`, or a "reset filters"
 * button. Paths are written in the record's order, so a later path wins over an earlier one
 * that overlaps it. Each path and value is checked against the state's type. Objects off the
 * paths are reused, and the input is never changed.
 *
 * @example
 * ```ts
 * const state = { session: { user: null as string | null, token: '' }, ui: { error: 'Expired', busy: true } }
 *
 * setManyAt(state, { 'session.user': 'ada', 'session.token': 't-1', 'ui.error': '', 'ui.busy': false })
 * // => { session: { user: 'ada', token: 't-1' }, ui: { error: '', busy: false } }
 *
 * const next = R.pipe(state, setManyAt({ 'ui.busy': false }))
 * next.session === state.session
 * // => true
 * ```
 *
 * @tags set, many, batch, bulk, multiple, update, paths, reducer, immutable, lens
 * @see setAt - one path at a time
 * @see set - @ontologyio/receta/lens, the write at each path
 */
export function setManyAt<S, U extends Record<string, unknown>>(state: S, updates: SetManyAtUpdates<S, U>): S
export function setManyAt<S, U extends Record<string, unknown>>(updates: SetManyAtUpdates<S, U>): (state: S) => S
export function setManyAt(...args: unknown[]): unknown {
  return R.purry(setManyAtImplementation, args)
}

const setManyAtImplementation = <S>(state: S, updates: Readonly<Record<string, unknown>>): S =>
  R.reduce(R.entries(updates), (current, [at, value]) => set(path<S, unknown>(at), value, current), state)
