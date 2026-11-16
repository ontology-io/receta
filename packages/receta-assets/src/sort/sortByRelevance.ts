import * as R from 'remeda'
import { compose, descending, natural } from '@ontologyio/receta/compare'

/**
 * Sorts search results by score, best first, and breaks ties by name in natural order.
 *
 * Use when: showing search or autocomplete results, where many results share a score and an
 * unstable order would make the list jump between keystrokes. Equal scores fall back to the
 * name, compared naturally ('Plan 2' before 'plan 10', case ignored), so the order is the same
 * every time.
 *
 * @example
 * ```ts
 * const results = [
 *   { title: 'Pricing', score: 0.4 },
 *   { title: 'Plan 10', score: 0.9 },
 *   { title: 'plan 2', score: 0.9 },
 *   { title: 'Plans FAQ', score: 0.7 },
 * ]
 *
 * R.pipe(
 *   sortByRelevance(results, (result) => result.score, (result) => result.title),
 *   R.map(R.prop('title')),
 * )
 * // => ['plan 2', 'Plan 10', 'Plans FAQ', 'Pricing']
 *
 * R.pipe(['b', 'a', 'c'], sortByRelevance(R.constant(1), R.identity()))
 * // => ['a', 'b', 'c']
 * ```
 *
 * @tags sort, relevance, search, score, ranking, autocomplete, results, tie-breaker, stable
 * @see sortByWeightedScore - builds the score from several fields
 * @see natural - @ontologyio/receta/compare, the tie-break by name
 */
export function sortByRelevance<T>(
  items: readonly T[],
  score: (item: T) => number,
  name: (item: T) => string,
): readonly T[]
export function sortByRelevance<T>(
  score: (item: T) => number,
  name: (item: T) => string,
): (items: readonly T[]) => readonly T[]
export function sortByRelevance(...args: unknown[]): unknown {
  return R.purry(sortByRelevanceImplementation, args)
}

const sortByRelevanceImplementation = <T>(
  items: readonly T[],
  score: (item: T) => number,
  name: (item: T) => string,
): readonly T[] => R.sort(items, compose(descending(score), natural(name)))
