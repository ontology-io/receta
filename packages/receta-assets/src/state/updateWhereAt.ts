import * as R from 'remeda'
import { when } from '@ontologyio/receta/function'
import { over, path, view } from '@ontologyio/receta/lens'

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
export type UpdateWhereAtItem<S, P extends string> = NonNullable<ValueAt<S, P>> extends readonly (infer Item)[]
  ? Item
  : never

/** `P` when it is a dot path to an array inside `S`, otherwise `never`, so the call doesn't compile. */
export type UpdateWhereAtPath<S, P extends string> = [UpdateWhereAtItem<S, P>] extends [never] ? never : P

/**
 * Returns new state where each item of the array at a dot path that matches a predicate is replaced by `update(item)`.
 *
 * Use when: one action changes many items of a nested list, such as "mark all as read",
 * "archive everything older than a week" or "apply the discount to every line from this
 * vendor". Items that don't match are kept as the same objects, in the same order. A missing
 * array stays missing. The path must lead to an array, and both functions get its item type.
 *
 * @example
 * ```ts
 * import { eq, where } from '@ontologyio/receta/predicate'
 *
 * const state = {
 *   inbox: { messages: [{ id: 1, read: false, from: 'ci' }, { id: 2, read: false, from: 'ada' }] },
 * }
 *
 * R.pipe(state, updateWhereAt('inbox.messages', where({ from: eq('ci') }), (message) => ({ ...message, read: true })))
 * // => { inbox: { messages: [{ id: 1, read: true, from: 'ci' }, { id: 2, read: false, from: 'ada' }] } }
 *
 * updateWhereAt(state, 'inbox.messages', R.constant(true), (message) => ({ ...message, read: true })).inbox
 * // => { messages: [{ id: 1, read: true, from: 'ci' }, { id: 2, read: true, from: 'ada' }] }
 * ```
 *
 * @tags update, map, bulk, mark all, mark read, where, array, list, immutable, lens
 * @see updateById - changes the one item with an id
 * @see removeWhereAt - removes the matching items instead
 * @see when - @ontologyio/receta/function, applies the update only to matching items
 */
export function updateWhereAt<S, P extends string>(
  state: S,
  at: UpdateWhereAtPath<S, P>,
  predicate: (item: UpdateWhereAtItem<S, P>) => boolean,
  update: (item: UpdateWhereAtItem<S, P>) => UpdateWhereAtItem<S, P>,
): S
export function updateWhereAt<S, P extends string>(
  at: UpdateWhereAtPath<S, P>,
  predicate: (item: UpdateWhereAtItem<S, P>) => boolean,
  update: (item: UpdateWhereAtItem<S, P>) => UpdateWhereAtItem<S, P>,
): (state: S) => S
export function updateWhereAt(...args: unknown[]): unknown {
  return R.purry(updateWhereAtImplementation, args)
}

const updateWhereAtImplementation = <S>(
  state: S,
  at: string,
  predicate: (item: unknown) => boolean,
  update: (item: unknown) => unknown,
): S => {
  const listLens = path<S, readonly unknown[] | undefined>(at)
  // Writing through the lens would create the path, so a missing list is left alone.
  if (R.isNullish(view(listLens, state))) return state
  return over(listLens, (list = []) => R.map(list, when(predicate, update)), state)
}
