import * as R from 'remeda'
import { compose, descending } from '@ontologyio/receta/compare'

/**
 * Keeps the newest item per key and lists them newest first.
 *
 * Use when: building an inbox with the last message per conversation, the current status
 * per order from an event log, or the latest reading per sensor. When two items of one key
 * share a timestamp, the later one in the input wins, as in an append-only log. Keys compare
 * as strings, so `1` and `'1'` are the same key. Timestamps are `Date`s or epoch numbers;
 * parse ISO strings first.
 *
 * @example
 * ```ts
 * const messages = [
 *   { thread: 'ops', text: 'deploy done', at: 100 },
 *   { thread: 'sales', text: 'call at 3', at: 140 },
 *   { thread: 'ops', text: 'rollback', at: 180 },
 *   { thread: 'hr', text: 'welcome!', at: 120 },
 * ]
 *
 * latestBy(messages, (message) => message.thread, (message) => message.at)
 * // => [
 * //   { thread: 'ops', text: 'rollback', at: 180 },
 * //   { thread: 'sales', text: 'call at 3', at: 140 },
 * //   { thread: 'hr', text: 'welcome!', at: 120 },
 * // ]
 *
 * const events = [
 *   { order: 7, status: 'paid', at: new Date('2024-05-01T10:00:00Z') },
 *   { order: 7, status: 'shipped', at: new Date('2024-05-01T10:00:00Z') },
 * ]
 * R.pipe(events, latestBy((event) => event.order, (event) => event.at), R.map(R.prop('status')))
 * // => ['shipped']
 * ```
 *
 * @tags latest, newest, most recent, last, current state, per key, inbox, event log, snapshot
 * @see dedupeByKeepLast - the last copy per key by position, not by time
 * @see dedupeByKeepBest - keeps input order and returns the dropped copies; on a tie the first wins
 * @see descending - @ontologyio/receta/compare, the newest-first order
 */
export function latestBy<T>(
  items: readonly T[],
  key: (item: T) => string | number,
  timestamp: (item: T) => Date | number,
): readonly T[]
export function latestBy<T>(
  key: (item: T) => string | number,
  timestamp: (item: T) => Date | number,
): (items: readonly T[]) => readonly T[]
export function latestBy(...args: unknown[]): unknown {
  return R.purry(latestByImplementation, args)
}

type Entry<T> = { readonly item: T; readonly index: number; readonly time: number }

// Newest first, and on a tie the item that came later in the input.
const newestFirst = compose<Entry<unknown>>(
  descending((entry) => entry.time),
  descending((entry) => entry.index),
)

const latestByImplementation = <T>(
  items: readonly T[],
  key: (item: T) => string | number,
  timestamp: (item: T) => Date | number,
): readonly T[] =>
  R.pipe(
    items,
    R.map((item, index): Entry<T> => ({ item, index, time: Number(timestamp(item)) })),
    R.groupBy((entry) => key(entry.item)),
    R.values(),
    R.map((group) => R.first(R.sort(group, newestFirst))),
    R.sort(newestFirst),
    R.map((entry) => entry.item),
  )
