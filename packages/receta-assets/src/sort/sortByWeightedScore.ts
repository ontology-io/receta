import * as R from 'remeda'
import { descending } from '@ontologyio/receta/compare'
import { normalize, sum } from '@ontologyio/receta/number'

/** A weight per numeric field. A negative weight means lower is better, as with price. */
export type SortByWeightedScoreWeights<T> = {
  readonly [K in keyof T as T[K] extends number ? K : never]?: number
}

export type SortByWeightedScoreEntry<T> = {
  readonly item: T
  /** The weighted sum of the item's fields, each scaled to 0–1 across the list. */
  readonly score: number
}

/**
 * Ranks items by a weighted mix of numeric fields, each scaled to 0–1 first, and gives every item its score.
 *
 * Use when: ranking products by rating and price, candidates by several criteria, or servers by
 * load and latency, where fields have different units. Each field is min-max scaled across the
 * list, so a price in dollars can't drown a rating out of 5. Give a field a negative weight when
 * lower is better. A field where every item has the same value adds nothing. Equal scores keep
 * their input order. Scores are relative to this list, so they change when the list does.
 *
 * @example
 * ```ts
 * import { round } from '@ontologyio/receta/number'
 *
 * const products = [
 *   { name: 'A', rating: 4.5, price: 20 },
 *   { name: 'B', rating: 4.0, price: 10 },
 *   { name: 'C', rating: 5.0, price: 40 },
 * ]
 *
 * R.pipe(
 *   sortByWeightedScore(products, { rating: 0.7, price: -0.3 }),
 *   R.map(({ item, score }) => `${item.name} ${round(score, 2)}`),
 * )
 * // => ['C 0.4', 'A 0.25', 'B 0']
 *
 * R.pipe([{ cpu: 50 }], sortByWeightedScore({ cpu: -1 }))
 * // => [{ item: { cpu: 50 }, score: 0 }]
 * ```
 *
 * @tags sort, rank, weighted, score, multi-criteria, normalize, ranking, recommendation, scoring
 * @see sortByRelevance - a score you already have, with a tie-break by name
 * @see normalize - @ontologyio/receta/number, the 0–1 scaling of each field
 */
export function sortByWeightedScore<T>(
  items: readonly T[],
  weights: SortByWeightedScoreWeights<NoInfer<T>>,
): readonly SortByWeightedScoreEntry<T>[]
export function sortByWeightedScore<T>(
  weights: SortByWeightedScoreWeights<T>,
): (items: readonly T[]) => readonly SortByWeightedScoreEntry<T>[]
export function sortByWeightedScore(...args: unknown[]): unknown {
  return R.purry(sortByWeightedScoreImplementation, args)
}

const sortByWeightedScoreImplementation = <T>(
  items: readonly T[],
  weights: SortByWeightedScoreWeights<T>,
): readonly SortByWeightedScoreEntry<T>[] => {
  const weighted: Readonly<Record<string, number | undefined>> = weights
  const valueOf = (item: T, field: string): number => Number(item[field as keyof T])
  // One scorer per field: scale the item's value to 0–1 across the list, then weigh it.
  const scorers = R.map(R.keys(weighted), (field) => {
    const values = R.map(items, (item) => valueOf(item, field))
    const low = R.firstBy(values, R.identity()) ?? 0
    const high = R.firstBy(values, [R.identity(), 'desc']) ?? 0
    const weight = weighted[field] ?? 0
    return (item: T): number => weight * normalize(valueOf(item, field), low, high)
  })
  return R.pipe(
    items,
    R.map((item) => ({ item, score: sum(R.map(scorers, (scorer) => scorer(item))) })),
    R.sort(descending((entry: SortByWeightedScoreEntry<T>) => entry.score)),
  )
}
