import * as R from 'remeda'
import { average } from '@ontologyio/receta/number'
import type { Option } from '@ontologyio/receta/option'
import { isFiniteNumber } from '@ontologyio/receta/predicate'

/**
 * Averages one number from each item, skipping items where it is missing or not a number.
 *
 * Use when: computing an average rating, score or duration over records where some values
 * are `null`, `undefined` or `NaN`, such as unrated reviews or unfinished runs. Skipped
 * items don't count toward the average, so they don't drag it down to zero. Returns `None`
 * when no item has a value, so an empty list can't show `NaN`.
 *
 * @example
 * ```ts
 * const reviews = [{ stars: 5 }, { stars: null }, { stars: 4 }]
 *
 * averageBy(reviews, (review) => review.stars)
 * // => Some(4.5)
 *
 * R.pipe([{ stars: null }], averageBy((review: { stars: number | null }) => review.stars))
 * // => None
 *
 * averageBy([] as readonly { ms: number }[], (run) => run.ms)
 * // => None
 * ```
 *
 * @tags average, mean, ratings, missing, null, statistics, aggregate, skip
 * @see average - @ontologyio/receta/number, the mean as an Option
 * @see weightedAverage - when some items count more than others
 */
export function averageBy<T>(items: readonly T[], value: (item: T) => number | null | undefined): Option<number>
export function averageBy<T>(value: (item: T) => number | null | undefined): (items: readonly T[]) => Option<number>
export function averageBy(...args: unknown[]): unknown {
  return R.purry(averageByImplementation, args)
}

const averageByImplementation = <T>(
  items: readonly T[],
  value: (item: T) => number | null | undefined,
): Option<number> => average(R.pipe(items, R.map(value), R.filter(isFiniteNumber)))
