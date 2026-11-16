import * as R from 'remeda'
import { over, path } from '@ontologyio/receta/lens'
import { clamp } from '@ontologyio/receta/number'

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

/** `P` when it is a dot path to a number inside `S`, otherwise `never`, so the call doesn't compile. */
export type IncrementClampedAtPath<S, P extends string> = [ValueAt<S, P>] extends [never]
  ? never
  : ValueAt<S, P> extends number | undefined
    ? P
    : never

export type IncrementClampedAtRange = { readonly min: number; readonly max: number }

/**
 * Returns new state with the number at a dot path stepped by an amount and kept between a minimum and a maximum.
 *
 * Use when: a stepper, slider or keyboard shortcut moves a bounded number, such as a quantity
 * from 1 to the stock level, a zoom level, a volume or a page index, and pressing "+" at the
 * top must stay at the top. A missing value starts at `min`. The result is clamped even if
 * the stored value was already out of range. The path must lead to a number in the state's
 * type, or the call doesn't compile.
 *
 * @example
 * ```ts
 * const state = { cart: { quantity: 9 }, viewer: { zoom: 1 } }
 *
 * incrementClampedAt(state, 'cart.quantity', 5, { min: 1, max: 10 }).cart
 * // => { quantity: 10 }
 *
 * R.pipe(state, incrementClampedAt('viewer.zoom', -2, { min: 0.5, max: 4 })).viewer
 * // => { zoom: 0.5 }
 *
 * incrementClampedAt(state, 'cart.quantity', -1, { min: 1, max: 10 }).cart
 * // => { quantity: 8 }
 * ```
 *
 * @tags stepper, clamp, range, bounds, quantity, zoom, volume, increment, decrement, lens
 * @see incrementAt - the same step without bounds
 * @see clamp - @ontologyio/receta/number, keeps the result in range
 * @see over - @ontologyio/receta/lens, applies the step through the path lens
 */
export function incrementClampedAt<S, P extends string>(
  state: S,
  at: IncrementClampedAtPath<S, P>,
  by: number,
  range: IncrementClampedAtRange,
): S
export function incrementClampedAt<S, P extends string>(
  at: IncrementClampedAtPath<S, P>,
  by: number,
  range: IncrementClampedAtRange,
): (state: S) => S
export function incrementClampedAt(...args: unknown[]): unknown {
  return R.purry(incrementClampedAtImplementation, args)
}

const incrementClampedAtImplementation = <S>(
  state: S,
  at: string,
  by: number,
  { min, max }: IncrementClampedAtRange,
): S => over(path<S, number | undefined>(at), (value) => clamp((value ?? min) + by, min, max), state)
