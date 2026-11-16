import * as R from 'remeda'
import { fromNullable, type Option } from '@ontologyio/receta/option'
import { eq } from '@ontologyio/receta/predicate'

/**
 * Returns the value after the current one in a fixed cycle, wrapping from the last back to the first.
 *
 * Use when: a control steps through a short list of states, such as a sort header going
 * asc → desc → none, a theme toggle going light → dark → system, ArrowDown moving through menu
 * items, or a carousel's next button. A current value that isn't in the cycle restarts at the
 * first, so stale state recovers. Values compare with `===`. `None` only for an empty cycle.
 *
 * @example
 * ```ts
 * const sortOrder = ['asc', 'desc', 'none'] as const
 *
 * nextInCycle('asc', sortOrder)
 * // => Some('desc')
 *
 * nextInCycle('none', sortOrder)
 * // => Some('asc')
 *
 * R.pipe('sideways', nextInCycle(['light', 'dark', 'system']))
 * // => Some('light')
 *
 * nextInCycle('a', [])
 * // => None
 * ```
 *
 * @tags cycle, toggle, next, wrap around, rotate, sort direction, theme, carousel, keyboard
 * @see previousInCycle - the value before, for ArrowUp or a back button
 * @see transitionState - moves between states by named events instead of in a ring
 */
export function nextInCycle<T>(current: T, cycle: readonly T[]): Option<T>
export function nextInCycle<T>(cycle: readonly T[]): (current: T) => Option<T>
export function nextInCycle(...args: unknown[]): unknown {
  return R.purry(nextInCycleImplementation, args)
}

const nextInCycleImplementation = <T>(current: T, cycle: readonly T[]): Option<T> => {
  // Not found is -1, and -1 + 1 lands on the first value, which is where a stale value restarts.
  const at = R.findIndex(cycle, eq(current))
  return fromNullable(cycle[(at + 1) % Math.max(cycle.length, 1)])
}
