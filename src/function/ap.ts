import * as R from 'remeda'

/**
 * Applies an array of functions to an array of values (applicative apply).
 *
 * Creates all possible combinations by applying each function to each value,
 * returning a flat array of results.
 *
 * This is useful for applying multiple transformations across multiple values,
 * though in practice `juxt` or `converge` are often more intuitive.
 *
 * @example
 * ```typescript
 * const fns = [
 *   (n: number) => n + 1,
 *   (n: number) => n * 2,
 *   (n: number) => n * n
 * ]
 *
 * ap(fns, [1, 2, 3])
 * // => [
 * //   2, 3, 4,      // addOne to each
 * //   2, 4, 6,      // double each
 * //   1, 4, 9       // square each
 * // ]
 * ```
 *
 * @example
 * ```typescript
 * // Apply multiple validators to multiple inputs
 * const validators = [
 *   (s: string) => s.length > 0,
 *   (s: string) => s.length < 100,
 *   (s: string) => /^[a-z]+$/i.test(s)
 * ]
 *
 * ap(validators, ['hello', '', 'test123'])
 * // => [
 * //   true, false, true,    // length > 0
 * //   true, true, true,     // length < 100
 * //   true, false, false    // only letters
 * // ]
 * ```
 *
 * @example
 * ```typescript
 * // Data-first
 * const fns = [(n: number) => n + 10, (n: number) => n * 10]
 * const result = ap(fns, [1, 2, 3])
 * // => [11, 12, 13, 10, 20, 30]
 * ```
 */
export function ap<T, U>(fns: readonly ((value: T) => U)[]): (values: readonly T[]) => U[]
export function ap<T, U>(fns: readonly ((value: T) => U)[], values: readonly T[]): U[]
export function ap<T, U>(
  fns: readonly ((value: T) => U)[],
  values?: readonly T[]
): U[] | ((values: readonly T[]) => U[]) {
  return values === undefined
    ? (vals: readonly T[]) => apImplementation(fns, vals)
    : apImplementation(fns, values)
}

function apImplementation<T, U>(
  fns: readonly ((value: T) => U)[],
  values: readonly T[]
): U[] {
  return fns.flatMap((fn) => values.map(fn))
}
