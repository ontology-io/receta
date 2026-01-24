import * as R from 'remeda'

/**
 * Composes functions from right to left.
 *
 * Creates a new function that applies the given functions in reverse order,
 * passing the result of each function as input to the next.
 *
 * This is the mathematical composition: (f ∘ g)(x) = f(g(x))
 *
 * **Note**: For left-to-right composition (more common in data pipelines),
 * use Remeda's `pipe` function instead.
 *
 * @example
 * ```typescript
 * const addOne = (n: number) => n + 1
 * const double = (n: number) => n * 2
 * const square = (n: number) => n * n
 *
 * const f = compose(square, double, addOne)
 * f(2)  // => square(double(addOne(2))) => square(double(3)) => square(6) => 36
 * ```
 *
 * @example
 * ```typescript
 * // String transformations
 * const exclaim = (s: string) => `${s}!`
 * const toUpper = (s: string) => s.toUpperCase()
 * const trim = (s: string) => s.trim()
 *
 * const shout = compose(exclaim, toUpper, trim)
 * shout('  hello  ')  // => 'HELLO!'
 * ```
 *
 * @example
 * ```typescript
 * // For left-to-right, use pipe instead
 * import { pipe } from 'remeda'
 *
 * const result = pipe(
 *   '  hello  ',
 *   trim,
 *   toUpper,
 *   exclaim
 * )
 * // => 'HELLO!'
 * ```
 *
 * @see https://remedajs.com/docs#pipe - For left-to-right composition
 */
export function compose<A, B>(fn1: (a: A) => B): (a: A) => B
export function compose<A, B, C>(fn2: (b: B) => C, fn1: (a: A) => B): (a: A) => C
export function compose<A, B, C, D>(
  fn3: (c: C) => D,
  fn2: (b: B) => C,
  fn1: (a: A) => B
): (a: A) => D
export function compose<A, B, C, D, E>(
  fn4: (d: D) => E,
  fn3: (c: C) => D,
  fn2: (b: B) => C,
  fn1: (a: A) => B
): (a: A) => E
export function compose<A, B, C, D, E, F>(
  fn5: (e: E) => F,
  fn4: (d: D) => E,
  fn3: (c: C) => D,
  fn2: (b: B) => C,
  fn1: (a: A) => B
): (a: A) => F
export function compose(...fns: Array<(arg: any) => any>): (arg: any) => any {
  return (initialValue: any) => {
    return R.reduce(fns.slice().reverse(), (value, fn) => fn(value), initialValue)
  }
}
