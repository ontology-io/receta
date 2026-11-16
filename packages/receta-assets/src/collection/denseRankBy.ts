import * as R from 'remeda'
import { descending } from '@ontologyio/receta/compare'

export type DenseRankByEntry<T> = {
  readonly item: T
  readonly score: number
  /** 1 for the highest score. Equal scores share a rank, and the next score gets the next number. */
  readonly rank: number
}

/**
 * Ranks items by score, highest first, where ties share a rank and no numbers are skipped: 1, 1, 2.
 *
 * Use when: labelling tiers or levels, such as "gold, silver, bronze" for the three best
 * distinct scores, or grouping equal results under one place number. Items with equal scores
 * keep their input order. For sports-style ranks that skip after a tie (1, 1, 3), use
 * `competitionRankBy`.
 *
 * @example
 * ```ts
 * const players = [
 *   { name: 'ana', points: 80 },
 *   { name: 'bo', points: 95 },
 *   { name: 'cy', points: 80 },
 *   { name: 'di', points: 60 },
 * ]
 *
 * R.pipe(
 *   denseRankBy(players, (player) => player.points),
 *   R.map(({ item, rank }) => `${rank}. ${item.name}`),
 * )
 * // => ['1. bo', '2. ana', '2. cy', '3. di']
 *
 * R.pipe([7, 7, 7], denseRankBy(R.identity()), R.map(R.prop('rank')))
 * // => [1, 1, 1]
 * ```
 *
 * @tags rank, dense rank, ranking, leaderboard, tiers, ties, place, standings
 * @see competitionRankBy - ranks that skip after a tie, 1, 1, 3
 * @see topNBy - just the best n items, without ranks
 */
export function denseRankBy<T>(items: readonly T[], score: (item: T) => number): readonly DenseRankByEntry<T>[]
export function denseRankBy<T>(score: (item: T) => number): (items: readonly T[]) => readonly DenseRankByEntry<T>[]
export function denseRankBy(...args: unknown[]): unknown {
  return R.purry(denseRankByImplementation, args)
}

type Scored<T> = { readonly item: T; readonly score: number }

const denseRankByImplementation = <T>(items: readonly T[], score: (item: T) => number): readonly DenseRankByEntry<T>[] => {
  const scored = R.pipe(
    items,
    R.map((item): Scored<T> => ({ item, score: score(item) })),
    R.sort(descending((entry: Scored<T>) => entry.score)),
  )
  // Whether each entry ties the one before it. The first has nothing before it.
  const tiesPrevious = [false, ...R.zipWith(scored, R.drop(scored, 1), (a, b) => a.score === b.score)]
  const ranks = R.mapWithFeedback(tiesPrevious, (rank, tie) => (tie ? rank : rank + 1), 0)
  return R.zipWith(scored, ranks, (entry, rank) => ({ ...entry, rank }))
}
