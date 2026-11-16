import * as R from 'remeda'
import { batchBy } from '@ontologyio/receta/collection'
import { fromNullable, map, unwrapOr } from '@ontologyio/receta/option'

export type GroupConsecutiveWithinGroup<T> = {
  readonly key: string | number
  readonly items: readonly T[]
}

/**
 * Groups runs of neighbouring items that share a key and follow each other within a time gap.
 *
 * Use when: stacking chat bubbles from one sender, collapsing an activity feed into "Ana made
 * 3 edits", or grouping log lines into bursts. A new group starts when the key changes or when
 * more than `maxGapMs` passed since the previous item. Pass `Infinity` to group by key alone.
 * Items should already be in time order; this doesn't sort them.
 *
 * @example
 * ```ts
 * const messages = [
 *   { from: 'ana', text: 'hi', at: 0 },
 *   { from: 'ana', text: 'are you there?', at: 60_000 },
 *   { from: 'bo', text: 'yes', at: 90_000 },
 *   { from: 'bo', text: 'back now', at: 900_000 },
 * ]
 *
 * R.pipe(
 *   groupConsecutiveWithin(messages, (message) => message.from, (message) => message.at, 5 * 60_000),
 *   R.map((group) => [group.key, group.items.length]),
 * )
 * // => [['ana', 2], ['bo', 1], ['bo', 1]]
 *
 * R.pipe(['a', 'a', 'b', 'a'], groupConsecutiveWithin(R.identity(), R.constant(0), Infinity))
 * // => [{ key: 'a', items: ['a', 'a'] }, { key: 'b', items: ['b'] }, { key: 'a', items: ['a'] }]
 * ```
 *
 * @tags group, consecutive, runs, chat, messages, bubbles, feed, burst, collapse, sessionize
 * @see batchBy - @ontologyio/receta/collection, groups neighbours by key alone
 */
export function groupConsecutiveWithin<T>(
  items: readonly T[],
  key: (item: T) => string | number,
  at: (item: T) => Date | number,
  maxGapMs: number,
): readonly GroupConsecutiveWithinGroup<T>[]
export function groupConsecutiveWithin<T>(
  key: (item: T) => string | number,
  at: (item: T) => Date | number,
  maxGapMs: number,
): (items: readonly T[]) => readonly GroupConsecutiveWithinGroup<T>[]
export function groupConsecutiveWithin(...args: unknown[]): unknown {
  return R.purry(groupConsecutiveWithinImplementation, args)
}

const groupConsecutiveWithinImplementation = <T>(
  items: readonly T[],
  key: (item: T) => string | number,
  at: (item: T) => Date | number,
  maxGapMs: number,
): readonly GroupConsecutiveWithinGroup<T>[] => {
  const continues = (previous: T, item: T): boolean =>
    key(previous) === key(item) && Number(at(item)) - Number(at(previous)) <= maxGapMs
  // The first item has no previous item, so it always starts a run.
  const startsRun = (item: T, index: number): boolean =>
    R.pipe(
      fromNullable(items[index - 1]),
      map((previous) => !continues(previous, item)),
      unwrapOr(true),
    )
  // Number each run, then let batchBy cut where the run number changes.
  const runNumbers = R.mapWithFeedback(items, (run, item, index) => (startsRun(item, index) ? run + 1 : run), 0)
  return R.pipe(
    batchBy(R.zip(items, runNumbers), ([, run]) => run),
    R.map((run) => R.map(run, ([item]) => item)),
    R.flatMap((run) => (R.hasAtLeast(run, 1) ? [{ key: key(run[0]), items: run }] : [])),
  )
}
