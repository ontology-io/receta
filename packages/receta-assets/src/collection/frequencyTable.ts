import * as R from 'remeda'
import { compose, descending, natural } from '@ontologyio/receta/compare'
import { ratio } from '@ontologyio/receta/number'

export type FrequencyTableRow = {
  readonly key: string
  readonly count: number
  /** The count as a fraction of all items, so 0.25 is a quarter. */
  readonly share: number
}

/**
 * Counts items per key and lists each key with its count and share of the total, most common first.
 *
 * Use when: filling facet counts in a search sidebar ("Red (12)"), showing traffic by browser,
 * or summarizing survey answers. Keys with equal counts come in natural order, so `'v2'` comes
 * before `'v10'`. Shares are fractions; format them with `toPercent` from
 * `@ontologyio/receta/number`.
 *
 * @example
 * ```ts
 * const visits = [
 *   { browser: 'Firefox' },
 *   { browser: 'Chrome' },
 *   { browser: 'Safari' },
 *   { browser: 'Chrome' },
 * ]
 *
 * frequencyTable(visits, (visit) => visit.browser)
 * // => [
 * //   { key: 'Chrome', count: 2, share: 0.5 },
 * //   { key: 'Firefox', count: 1, share: 0.25 },
 * //   { key: 'Safari', count: 1, share: 0.25 },
 * // ]
 *
 * R.pipe(['yes', 'no', 'yes', 'yes'], frequencyTable(R.identity()), R.map(R.prop('count')))
 * // => [3, 1]
 *
 * frequencyTable([], (visit: { browser: string }) => visit.browser)
 * // => []
 * ```
 *
 * @tags count, frequency, histogram, facets, distribution, share, breakdown, tally, group
 * @see totalsBy - adds up a number per key instead of counting
 * @see ratio - @ontologyio/receta/number, the share of the total
 */
export function frequencyTable<T>(items: readonly T[], key: (item: T) => string): readonly FrequencyTableRow[]
export function frequencyTable<T>(key: (item: T) => string): (items: readonly T[]) => readonly FrequencyTableRow[]
export function frequencyTable(...args: unknown[]): unknown {
  return R.purry(frequencyTableImplementation, args)
}

const mostCommonFirst = compose<FrequencyTableRow>(
  descending((row) => row.count),
  natural((row) => row.key),
)

const frequencyTableImplementation = <T>(items: readonly T[], key: (item: T) => string): readonly FrequencyTableRow[] =>
  R.pipe(
    R.countBy(items, key),
    R.entries(),
    R.map(([value, count]) => ({ key: value, count, share: ratio(count, items.length) })),
    R.sort(mostCommonFirst),
  )
