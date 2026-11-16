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

/** `P` when it is a dot path to a number inside `S`, otherwise `never`, so the call doesn't compile. */
export type IncrementAtPath<S, P extends string> = [ValueAt<S, P>] extends [never]
  ? never
  : ValueAt<S, P> extends number | undefined
    ? P
    : never

/**
 * Returns new state with the number at a dot path increased by an amount, where a missing count starts at 0.
 *
 * Use when: counting in state, such as unread messages, likes, a page number, a retry count or
 * `'stats.byDay.mon'`, and the counter may not exist yet. Pass a negative amount to decrease.
 * The path must lead to a number in the state's type, or the call doesn't compile. There are
 * no bounds: use `incrementClampedAt` for a stepper that must stay in a range.
 *
 * @example
 * ```ts
 * const state = { inbox: { unread: 4 }, likes: {} as Record<string, number> }
 *
 * incrementAt(state, 'inbox.unread', 1).inbox
 * // => { unread: 5 }
 *
 * R.pipe(state, incrementAt('likes.post-7', 1)).likes
 * // => { 'post-7': 1 }
 *
 * incrementAt(state, 'inbox.unread', -10).inbox
 * // => { unread: -6 }
 * ```
 *
 * @tags increment, decrement, counter, count, add, number, badge, immutable, reducer, lens
 * @see incrementClampedAt - the same step kept between a minimum and a maximum
 * @see over - @ontologyio/receta/lens, applies the addition through the path lens
 */
export function incrementAt<S, P extends string>(state: S, at: IncrementAtPath<S, P>, by: number): S
export function incrementAt<S, P extends string>(at: IncrementAtPath<S, P>, by: number): (state: S) => S
export function incrementAt(...args: unknown[]): unknown {
  return R.purry(incrementAtImplementation, args)
}

const incrementAtImplementation = <S>(state: S, at: string, by: number): S =>
  over(path<S, number | undefined>(at), (count) => (count ?? 0) + by, state)
