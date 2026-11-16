import * as R from 'remeda'
import { isSome, none, some, type Option } from '@ontologyio/receta/option'

/**
 * Remembers only the last call, and returns its result again while the arguments stay equal.
 *
 * Use when: an expensive function is called over and over with the same arguments, such as
 * a chart layout recomputed on each render or a validation run on each keystroke, and
 * remembering every past call would only grow memory. Arguments are compared deeply by
 * default, so a new array with the same items still counts as the same; pass `isSameArgs`
 * to compare another way, such as by identity.
 *
 * @example
 * ```ts
 * let layouts = 0
 * const layoutBars = (values: readonly number[], width: number) => {
 *   layouts += 1
 *   return R.map(values, (value) => value * width)
 * }
 * const cachedLayout = memoizeLatest(layoutBars)
 *
 * cachedLayout([1, 2], 10)
 * // => [10, 20]
 *
 * cachedLayout([1, 2], 10)
 * // => [10, 20]
 *
 * layouts
 * // => 1
 *
 * cachedLayout([1, 2], 20)
 * // => [20, 40]
 *
 * layouts
 * // => 2
 * ```
 *
 * @tags memoize one, last call, render, deep equal, recompute, cache size 1
 * @see memoizedSelector - the same idea for values selected from a state object
 * @see memoizeByArgs - remembers many calls instead of one
 */
export function memoizeLatest<A extends readonly unknown[], T>(
  fn: (...args: A) => T,
  isSameArgs: (previous: A, next: A) => boolean = (previous, next) => R.isDeepEqual(previous, next),
): (...args: A) => T {
  let last: Option<{ readonly args: A; readonly value: T }> = none()
  return (...args) => {
    if (isSome(last) && isSameArgs(last.value.args, args)) return last.value.value
    const value = fn(...args)
    last = some({ args, value })
    return value
  }
}
