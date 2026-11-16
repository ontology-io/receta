import * as R from 'remeda'
import { byBoolean, compose, descending, reverse } from '@ontologyio/receta/compare'

/**
 * Puts pinned items first, then lists each group newest first.
 *
 * Use when: ordering notes, chats, announcements or saved searches where users pin a few items
 * to the top and expect everything else by recency. Pinned items are also ordered newest first
 * among themselves. Items with the same pin state and date keep their input order. Dates are
 * `Date`s or epoch numbers.
 *
 * @example
 * ```ts
 * const notes = [
 *   { title: 'groceries', pinned: false, updatedAt: 300 },
 *   { title: 'wifi password', pinned: true, updatedAt: 100 },
 *   { title: 'ideas', pinned: false, updatedAt: 500 },
 *   { title: 'house rules', pinned: true, updatedAt: 200 },
 * ]
 *
 * R.pipe(
 *   pinnedFirst(notes, (note) => note.pinned, (note) => note.updatedAt),
 *   R.map(R.prop('title')),
 * )
 * // => ['house rules', 'wifi password', 'ideas', 'groceries']
 *
 * const chats = [{ id: 'a', pinned: false, at: 1 }, { id: 'b', pinned: false, at: 2 }]
 * R.pipe(chats, pinnedFirst((chat) => chat.pinned, (chat) => chat.at), R.map(R.prop('id')))
 * // => ['b', 'a']
 * ```
 *
 * @tags sort, pinned, sticky, favorites, starred, top, newest, recent, notes, chats
 * @see sortByPriorityThenNewest - several priority levels instead of pinned or not
 * @see byBoolean - @ontologyio/receta/compare, the pinned-or-not order, reversed
 */
export function pinnedFirst<T>(
  items: readonly T[],
  isPinned: (item: T) => boolean,
  date: (item: T) => Date | number,
): readonly T[]
export function pinnedFirst<T>(
  isPinned: (item: T) => boolean,
  date: (item: T) => Date | number,
): (items: readonly T[]) => readonly T[]
export function pinnedFirst(...args: unknown[]): unknown {
  return R.purry(pinnedFirstImplementation, args)
}

const pinnedFirstImplementation = <T>(
  items: readonly T[],
  isPinned: (item: T) => boolean,
  date: (item: T) => Date | number,
): readonly T[] =>
  // byBoolean puts false first, so reversing it brings the pinned items up.
  R.sort(items, compose(reverse(byBoolean(isPinned)), descending((item: T) => Number(date(item)))))
