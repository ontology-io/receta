import * as R from 'remeda'
import { fromNullable, map, type Option } from '@ontologyio/receta/option'
import { lte, where } from '@ontologyio/receta/predicate'

export type BandOfBand<L> = {
  /** The lowest value in this band. The band runs up to the next band's `from`. */
  readonly from: number
  readonly label: L
}

/**
 * Labels a number with the band it falls in, where each band starts at a threshold and runs to the next.
 *
 * Use when: turning a number into a level, such as a score into a grade, yearly spend into a
 * loyalty tier, a count into a size, or a latency into a rating. The band with the highest
 * `from` at or below the value wins, so bands can be listed in any order. The top band has no
 * upper limit. `None` when the value is below every band or is `NaN`, so add a band from
 * `-Infinity` when every number needs a label.
 *
 * @example
 * ```ts
 * const grades = [
 *   { from: 90, label: 'A' },
 *   { from: 80, label: 'B' },
 *   { from: 70, label: 'C' },
 *   { from: 0, label: 'F' },
 * ]
 *
 * bandOf(84, grades)
 * // => Some('B')
 *
 * bandOf(-3, grades)
 * // => None
 *
 * const tiers = [{ from: 0, label: 'bronze' }, { from: 1000, label: 'silver' }, { from: 5000, label: 'gold' }]
 * R.map([250, 1000, 12_000], bandOf(tiers))
 * // => [Some('bronze'), Some('silver'), Some('gold')]
 * ```
 *
 * @tags threshold, band, bucket, tier, grade, level, range, classify, score
 * @see where - @ontologyio/receta/predicate, keeps the bands that start at or below the value
 * @see slaStatus - two fixed thresholds over elapsed time
 */
export function bandOf<L>(value: number, bands: readonly BandOfBand<L>[]): Option<L>
export function bandOf<L>(bands: readonly BandOfBand<L>[]): (value: number) => Option<L>
export function bandOf(...args: unknown[]): unknown {
  return R.purry(bandOfImplementation, args)
}

const bandOfImplementation = <L>(value: number, bands: readonly BandOfBand<L>[]): Option<L> =>
  R.pipe(
    bands,
    R.filter(where<BandOfBand<L>>({ from: lte(value) })),
    R.firstBy([R.prop('from'), 'desc']),
    fromNullable,
    map((band) => band.label),
  )
