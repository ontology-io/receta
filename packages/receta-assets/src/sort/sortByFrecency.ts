import * as R from 'remeda'
import { descending } from '@ontologyio/receta/compare'

export type SortByFrecencyOptions<T> = {
  /** How many times the item was used. */
  readonly count: (item: T) => number
  /** When it was last used, as a `Date` or epoch milliseconds. */
  readonly lastUsedAt: (item: T) => Date | number
  /** The current time, passed in so the sort stays pure and testable. */
  readonly now: Date | number
  /** After this long without use, an item's weight halves. A week is a common choice. */
  readonly halfLifeMs: number
}

/**
 * Sorts items by frecency, a mix of how often and how recently they were used, so habits rise and stale favourites fade.
 *
 * Use when: ordering a command palette, recent files, emoji suggestions or "jump to" results,
 * where an item used 50 times last year should drop below one used 5 times today. Each item
 * scores `count × 0.5^(age / halfLifeMs)`. A last use in the future counts as now. Equal scores
 * keep their input order.
 *
 * @example
 * ```ts
 * const day = 24 * 60 * 60 * 1000
 * const now = 100 * day
 * const commands = [
 *   { name: 'deploy', uses: 20, lastUsedAt: now - 30 * day },
 *   { name: 'logs', uses: 5, lastUsedAt: now - day / 24 },
 *   { name: 'build', uses: 12, lastUsedAt: now - day },
 * ]
 * const options = {
 *   count: (command: (typeof commands)[number]) => command.uses,
 *   lastUsedAt: (command: (typeof commands)[number]) => command.lastUsedAt,
 *   now,
 *   halfLifeMs: 7 * day,
 * }
 *
 * R.pipe(sortByFrecency(commands, options), R.map(R.prop('name')))
 * // => ['build', 'logs', 'deploy']
 *
 * R.pipe(commands, sortByFrecency({ ...options, halfLifeMs: 365 * day }), R.map(R.prop('name')))
 * // => ['deploy', 'build', 'logs']
 * ```
 *
 * @tags sort, frecency, recent, frequent, command palette, suggestions, mru, decay, recently used
 * @see sortByFrequency - how often, without recency
 * @see descending - @ontologyio/receta/compare, the highest-score-first order
 */
export function sortByFrecency<T>(items: readonly T[], options: SortByFrecencyOptions<NoInfer<T>>): readonly T[]
export function sortByFrecency<T>(options: SortByFrecencyOptions<T>): (items: readonly T[]) => readonly T[]
export function sortByFrecency(...args: unknown[]): unknown {
  return R.purry(sortByFrecencyImplementation, args)
}

const sortByFrecencyImplementation = <T>(
  items: readonly T[],
  { count, lastUsedAt, now, halfLifeMs }: SortByFrecencyOptions<T>,
): readonly T[] => {
  const frecency = (item: T): number => {
    const ageMs = Math.max(0, Number(now) - Number(lastUsedAt(item)))
    return count(item) * 0.5 ** (ageMs / halfLifeMs)
  }
  return R.sort(items, descending(frecency))
}
