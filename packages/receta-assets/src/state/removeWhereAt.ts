import * as R from 'remeda'
import { over, path, view } from '@ontologyio/receta/lens'
import { not } from '@ontologyio/receta/predicate'

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
export type RemoveWhereAtItem<S, P extends string> = NonNullable<ValueAt<S, P>> extends readonly (infer Item)[]
  ? Item
  : never

/** `P` when it is a dot path to an array inside `S`, otherwise `never`, so the call doesn't compile. */
export type RemoveWhereAtPath<S, P extends string> = [RemoveWhereAtItem<S, P>] extends [never] ? never : P

/**
 * Returns new state without the items of the array at a dot path that match a predicate.
 *
 * Use when: clearing completed todos, dismissing read notifications, removing an item by id
 * from `'cart.lines'`, or dropping expired entries from a nested list. Pass a Receta
 * predicate such as `where({ done: eq(true) })`. Items keep their order. A missing array
 * stays missing, and objects off the path are reused. The path must lead to an array in the
 * state's type, and the predicate gets its item type.
 *
 * @example
 * ```ts
 * import { eq, where } from '@ontologyio/receta/predicate'
 *
 * const state = { todos: [{ id: 1, done: true }, { id: 2, done: false }, { id: 3, done: true }] }
 *
 * removeWhereAt(state, 'todos', where({ done: eq(true) }))
 * // => { todos: [{ id: 2, done: false }] }
 *
 * R.pipe(state, removeWhereAt('todos', where({ id: eq(2) })))
 * // => { todos: [{ id: 1, done: true }, { id: 3, done: true }] }
 * ```
 *
 * @tags remove, delete, filter, reject, array, list, clear completed, dismiss, immutable, lens
 * @see updateWhereAt - changes the matching items instead of removing them
 * @see over - @ontologyio/receta/lens, applies the filter through the path lens
 */
export function removeWhereAt<S, P extends string>(
  state: S,
  at: RemoveWhereAtPath<S, P>,
  predicate: (item: RemoveWhereAtItem<S, P>) => boolean,
): S
export function removeWhereAt<S, P extends string>(
  at: RemoveWhereAtPath<S, P>,
  predicate: (item: RemoveWhereAtItem<S, P>) => boolean,
): (state: S) => S
export function removeWhereAt(...args: unknown[]): unknown {
  return R.purry(removeWhereAtImplementation, args)
}

const removeWhereAtImplementation = <S>(state: S, at: string, predicate: (item: unknown) => boolean): S => {
  const listLens = path<S, readonly unknown[] | undefined>(at)
  // Writing through the lens would create the path, so a missing list is left alone.
  if (R.isNullish(view(listLens, state))) return state
  return over(listLens, (list = []) => R.filter(list, not(predicate)), state)
}
