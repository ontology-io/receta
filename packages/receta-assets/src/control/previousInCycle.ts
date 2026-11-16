import * as R from 'remeda'
import { fromNullable, type Option } from '@ontologyio/receta/option'
import { eq } from '@ontologyio/receta/predicate'

/**
 * Returns the value before the current one in a fixed cycle, wrapping from the first back to the last.
 *
 * Use when: stepping backwards through a short list, such as ArrowUp in a menu or listbox, a
 * carousel's back button, or shift-clicking a toggle to reverse it. A current value that isn't
 * in the cycle starts from the last, so ArrowUp with nothing selected lands on the bottom item.
 * Values compare with `===`. `None` only for an empty cycle.
 *
 * @example
 * ```ts
 * const items = ['cut', 'copy', 'paste']
 *
 * previousInCycle('copy', items)
 * // => Some('cut')
 *
 * previousInCycle('cut', items)
 * // => Some('paste')
 *
 * R.pipe('nothing selected', previousInCycle(items))
 * // => Some('paste')
 *
 * previousInCycle('a', [])
 * // => None
 * ```
 *
 * @tags cycle, previous, wrap around, rotate, keyboard, arrow up, menu, listbox, carousel
 * @see nextInCycle - the value after, for ArrowDown or a next button
 */
export function previousInCycle<T>(current: T, cycle: readonly T[]): Option<T>
export function previousInCycle<T>(cycle: readonly T[]): (current: T) => Option<T>
export function previousInCycle(...args: unknown[]): unknown {
  return R.purry(previousInCycleImplementation, args)
}

const previousInCycleImplementation = <T>(current: T, cycle: readonly T[]): Option<T> => {
  const at = R.findIndex(cycle, eq(current))
  // Not found starts from the end, as if the current value sat just past the last one.
  const from = at < 0 ? cycle.length : at
  return fromNullable(cycle[(from - 1 + cycle.length) % Math.max(cycle.length, 1)])
}
