import * as R from 'remeda'
import { descending } from '@ontologyio/receta/compare'
import { sum } from '@ontologyio/receta/number'

export type GroupTotal = {
  readonly key: string
  readonly total: number
  readonly count: number
}

/**
 * Groups items by a key, adds up a number per group, and lists the groups largest first.
 *
 * Use when: building a report row per category, such as hours per team, revenue per
 * product or errors per endpoint, where the biggest group should come first.
 *
 * ```text
 *  STEP                DATA AFTER IT
 *  ─────────────────   ─────────────────────────────────────────────
 *  items               [api 2h, web 5h, api 4h]
 *  R.groupBy(key)      { api: [2h, 4h], web: [5h] }
 *  R.entries           [['api', [2h, 4h]], ['web', [5h]]]
 *  R.map → sum         [{ api, total 6, count 2 }, { web, total 5, count 1 }]
 *  R.sort(descending)  largest total first
 * ```
 *
 * @example
 * ```ts
 * const hours = [
 *   { team: 'api', hours: 2 },
 *   { team: 'web', hours: 5 },
 *   { team: 'api', hours: 4 },
 * ]
 *
 * totalsBy(hours, (row) => row.team, (row) => row.hours)
 * // => [{ key: 'api', total: 6, count: 2 }, { key: 'web', total: 5, count: 1 }]
 *
 * R.pipe(hours, totalsBy((row) => row.team, R.constant(1)))
 * // => [{ key: 'api', total: 2, count: 2 }, { key: 'web', total: 1, count: 1 }]
 *
 * totalsBy([], (row: { team: string }) => row.team, R.constant(1))
 * // => []
 * ```
 *
 * @tags group, sum, aggregate, report, totals, leaderboard, rollup
 * @see sum - @ontologyio/receta/number, the addition per group
 * @see descending - @ontologyio/receta/compare, the largest-first order
 */
export function totalsBy<T>(
  items: readonly T[],
  key: (item: T) => string,
  value: (item: T) => number,
): readonly GroupTotal[]
export function totalsBy<T>(
  key: (item: T) => string,
  value: (item: T) => number,
): (items: readonly T[]) => readonly GroupTotal[]
export function totalsBy(...args: unknown[]): unknown {
  return R.purry(totalsByImplementation, args)
}

const totalsByImplementation = <T>(
  items: readonly T[],
  key: (item: T) => string,
  value: (item: T) => number,
): readonly GroupTotal[] =>
  R.pipe(
    items,
    R.groupBy(key),
    R.entries(),
    R.map(([group, members]) => ({ key: group, total: sum(R.map(members, value)), count: members.length })),
    R.sort(descending((entry: GroupTotal) => entry.total)),
  )
