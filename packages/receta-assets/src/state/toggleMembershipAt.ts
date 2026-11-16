import * as R from 'remeda'
import { over, path } from '@ontologyio/receta/lens'
import { neq, oneOf } from '@ontologyio/receta/predicate'

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
export type ToggleMembershipAtItem<S, P extends string> = NonNullable<ValueAt<S, P>> extends readonly (infer Item)[]
  ? Item
  : never

/**
 * Returns new state where a value is removed from the array at a dot path if present, or appended if not.
 *
 * Use when: a checkbox list, a tag picker, a filter chip or a multi-select table toggles one
 * id in `'selection.ids'` or `'filters.colors'`. Values compare with `===`, so use ids or
 * strings, not objects. Every copy of the value is removed when present. A missing array
 * becomes `[value]`. The path must lead to an array in the state's type and the value must
 * fit it.
 *
 * @example
 * ```ts
 * const state = { filters: { colors: ['red', 'blue'] }, selection: {} as { ids?: number[] } }
 *
 * toggleMembershipAt(state, 'filters.colors', 'red').filters
 * // => { colors: ['blue'] }
 *
 * toggleMembershipAt(state, 'filters.colors', 'green').filters
 * // => { colors: ['red', 'blue', 'green'] }
 *
 * R.pipe(state, toggleMembershipAt('selection.ids', 7)).selection
 * // => { ids: [7] }
 * ```
 *
 * @tags toggle, select, selection, checkbox, multi-select, tags, filters, chips, set, lens
 * @see pushAt - always appends
 * @see removeWhereAt - removes by a predicate
 * @see over - @ontologyio/receta/lens, applies the toggle through the path lens
 */
export function toggleMembershipAt<S, P extends string>(state: S, at: P, value: ToggleMembershipAtItem<S, P>): S
export function toggleMembershipAt<S, P extends string>(at: P, value: ToggleMembershipAtItem<S, P>): (state: S) => S
export function toggleMembershipAt(...args: unknown[]): unknown {
  return R.purry(toggleMembershipAtImplementation, args)
}

const toggleMembershipAtImplementation = <S>(state: S, at: string, value: unknown): S => {
  const toggle = (list: readonly unknown[] = []): readonly unknown[] =>
    oneOf(list)(value) ? R.filter(list, neq(value)) : [...list, value]
  return over(path<S, readonly unknown[] | undefined>(at), toggle, state)
}
