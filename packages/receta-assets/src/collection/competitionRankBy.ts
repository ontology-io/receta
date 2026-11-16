import * as R from 'remeda'
import { descending } from '@ontologyio/receta/compare'

export type CompetitionRankByEntry<T> = {
  readonly item: T
  readonly score: number
  /** 1 for the highest score. Equal scores share a rank, and the next rank skips the tied places. */
  readonly rank: number
}

/**
 * Ranks items by score, highest first, the way sports tables do: ties share a rank, then places are skipped (1, 1, 3).
 *
 * Use when: showing a leaderboard, exam results or a sales contest where "3rd" should mean two
 * people scored higher. Items with equal scores keep their input order. For ranks without gaps
 * (1, 1, 2), use `denseRankBy`.
 *
 * @example
 * ```ts
 * const runners = [
 *   { name: 'ana', points: 80 },
 *   { name: 'bo', points: 95 },
 *   { name: 'cy', points: 80 },
 *   { name: 'di', points: 60 },
 * ]
 *
 * R.pipe(
 *   competitionRankBy(runners, (runner) => runner.points),
 *   R.map(({ item, rank }) => `${rank}. ${item.name}`),
 * )
 * // => ['1. bo', '2. ana', '2. cy', '4. di']
 *
 * R.pipe([5, 9, 9], competitionRankBy(R.identity()), R.map(R.prop('rank')))
 * // => [1, 1, 3]
 * ```
 *
 * @tags rank, ranking, leaderboard, standings, competition, ties, place, scoreboard, 1224
 * @see denseRankBy - ranks without gaps after a tie, 1, 1, 2
 * @see topNBy - just the best n items, without ranks
 */
export function competitionRankBy<T>(
  items: readonly T[],
  score: (item: T) => number,
): readonly CompetitionRankByEntry<T>[]
export function competitionRankBy<T>(
  score: (item: T) => number,
): (items: readonly T[]) => readonly CompetitionRankByEntry<T>[]
export function competitionRankBy(...args: unknown[]): unknown {
  return R.purry(competitionRankByImplementation, args)
}

type Scored<T> = { readonly item: T; readonly score: number }

const competitionRankByImplementation = <T>(
  items: readonly T[],
  score: (item: T) => number,
): readonly CompetitionRankByEntry<T>[] => {
  const scored = R.pipe(
    items,
    R.map((item): Scored<T> => ({ item, score: score(item) })),
    R.sort(descending((entry: Scored<T>) => entry.score)),
  )
  // Whether each entry ties the one before it. The first has nothing before it.
  const tiesPrevious = [false, ...R.zipWith(scored, R.drop(scored, 1), (a, b) => a.score === b.score)]
  // A tie keeps the rank above it; anything else takes its own position, skipping the tied places.
  const ranks = R.mapWithFeedback(tiesPrevious, (rank, tie, index) => (tie ? rank : index + 1), 0)
  return R.zipWith(scored, ranks, (entry, rank) => ({ ...entry, rank }))
}
