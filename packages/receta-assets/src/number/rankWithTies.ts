import * as R from 'remeda'
import { toOrdinal } from '@ontologyio/receta/number'
import { gt, lt } from '@ontologyio/receta/predicate'

export type RankWithTiesEntry<T> = {
  readonly item: T
  /** 1 for the best; tied items share a rank and the next rank is skipped. */
  readonly rank: number
  /** The rank as an English ordinal: `1st`, `2nd`, `3rd`. */
  readonly label: string
}

/** `highest` for points and sales, `lowest` for race times and golf strokes. */
export type RankWithTiesBest = 'highest' | 'lowest'

/**
 * Ranks items by a score, best first, giving tied items the same rank: 1st, 1st, 3rd.
 *
 * Use when: building a leaderboard, a sales ranking or race results. Ties follow
 * competition ranking: two players tied for first are both `1st` and the next is `3rd`.
 * Pick `highest` when a bigger score wins and `lowest` when a smaller one does. Items with
 * equal scores keep their input order.
 *
 * @example
 * ```ts
 * const players = [
 *   { name: 'Ana', points: 90 },
 *   { name: 'Ben', points: 75 },
 *   { name: 'Cy', points: 90 },
 *   { name: 'Dee', points: 60 },
 * ]
 *
 * R.pipe(
 *   rankWithTies(players, (player) => player.points, 'highest'),
 *   R.map(({ label, item }) => `${label} ${item.name}`),
 * )
 * // => ['1st Ana', '1st Cy', '3rd Ben', '4th Dee']
 *
 * R.pipe(
 *   [{ lap: 61.2 }, { lap: 59.8 }],
 *   rankWithTies((run: { lap: number }) => run.lap, 'lowest'),
 *   R.map(R.prop('rank')),
 * )
 * // => [1, 2]
 * ```
 *
 * @tags rank, ranking, leaderboard, ties, ordinal, standings, competition, position
 * @see toOrdinal - @ontologyio/receta/number, the `1st`, `2nd`, `3rd` labels
 */
export function rankWithTies<T>(
  items: readonly T[],
  score: (item: T) => number,
  best: RankWithTiesBest,
): readonly RankWithTiesEntry<T>[]
export function rankWithTies<T>(
  score: (item: T) => number,
  best: RankWithTiesBest,
): (items: readonly T[]) => readonly RankWithTiesEntry<T>[]
export function rankWithTies(...args: unknown[]): unknown {
  return R.purry(rankWithTiesImplementation, args)
}

const rankWithTiesImplementation = <T>(
  items: readonly T[],
  score: (item: T) => number,
  best: RankWithTiesBest,
): readonly RankWithTiesEntry<T>[] => {
  const sorted = R.pipe(
    items,
    R.map((item) => ({ item, value: score(item) })),
    R.sortBy([R.prop('value'), best === 'highest' ? 'desc' : 'asc']),
  )
  const values = R.map(sorted, R.prop('value'))
  const beats = best === 'highest' ? gt : lt
  // Rank is one more than the number of items with a strictly better score.
  return R.map(sorted, ({ item, value }) => {
    const rank = R.filter(values, beats(value)).length + 1
    return { item, rank, label: toOrdinal(rank) }
  })
}
