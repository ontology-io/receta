import * as R from 'remeda'
import { compose, index, path, set, view } from '@ontologyio/receta/lens'
import { isUndefined } from '@ontologyio/receta/predicate'

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

/** `P` when it is a dot path to an array inside `S`, otherwise `never`, so the call doesn't compile. */
export type SwapAtPath<S, P extends string> = NonNullable<ValueAt<S, P>> extends readonly unknown[] ? P : never

/**
 * Returns new state with two items of the array at a dot path exchanged, leaving the others in place.
 *
 * Use when: a "move up" or "move down" button swaps neighbours, a puzzle or seating chart
 * swaps two cells, or a comparison view swaps the left and right item. If either position is
 * outside the array, or the array is missing, the state comes back unchanged. Use
 * `reorderAt` for drag and drop, where the items between should shift.
 *
 * @example
 * ```ts
 * const state = { form: { fields: ['name', 'email', 'phone'] } }
 *
 * swapAt(state, 'form.fields', 1, 2).form
 * // => { fields: ['name', 'phone', 'email'] }
 *
 * R.pipe(state, swapAt('form.fields', 0, 1)).form
 * // => { fields: ['email', 'name', 'phone'] }
 *
 * swapAt(state, 'form.fields', 0, 5) === state
 * // => true
 * ```
 *
 * @tags swap, exchange, move up, move down, reorder, array, list, positions, lens
 * @see reorderAt - moves one item and shifts the rest
 * @see index - @ontologyio/receta/lens, focuses each of the two positions
 */
export function swapAt<S, P extends string>(state: S, at: SwapAtPath<S, P>, first: number, second: number): S
export function swapAt<S, P extends string>(at: SwapAtPath<S, P>, first: number, second: number): (state: S) => S
export function swapAt(...args: unknown[]): unknown {
  return R.purry(swapAtImplementation, args)
}

const swapAtImplementation = <S>(state: S, at: string, first: number, second: number): S => {
  const listLens = path<S, readonly unknown[]>(at)
  const itemLens = (position: number) => compose(listLens, index<unknown>(position))
  const list: readonly unknown[] | undefined = view(listLens, state)
  if (R.isNullish(list)) return state
  const [a, b] = [view(index<unknown>(first), list), view(index<unknown>(second), list)]
  if (isUndefined(a) || isUndefined(b)) return state
  return R.pipe(state, set(itemLens(first), b), set(itemLens(second), a))
}
