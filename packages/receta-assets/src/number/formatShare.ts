import * as R from 'remeda'
import { switchCase } from '@ontologyio/receta/function'
import { clamp, toPercent } from '@ontologyio/receta/number'
import { and, gt, lt } from '@ontologyio/receta/predicate'

const underOnePercent = and(gt(0), lt(0.01))
const almostAll = and(gt(0.99), lt(1))

/**
 * Formats a share of a whole as a whole percent that never rounds to a misleading 0% or 100%.
 *
 * Use when: labelling a slice of a chart, a progress share or a market share where `0%`
 * would claim nothing and `100%` would claim everything. A share above zero but under 1%
 * reads `<1%`; one above 99% but not all reads `>99%`. The input is a ratio between 0 and
 * 1; values outside that range are clamped.
 *
 * @example
 * ```ts
 * formatShare(0.4567)
 * // => '46%'
 *
 * formatShare(0.004)
 * // => '<1%'
 *
 * formatShare(0.9971)
 * // => '>99%'
 *
 * formatShare(1.2)
 * // => '100%'
 * ```
 *
 * @tags percent, share, ratio, pie chart, proportion, label, rounding, portion
 * @see toPercent - @ontologyio/receta/number, the percent text
 * @see clamp - @ontologyio/receta/number, keeps the ratio between 0 and 1
 * @see percentOfTotal - whole percents for every slice that add up to 100
 */
export function formatShare(ratio: number): string {
  const share = clamp(ratio, 0, 1)
  return switchCase(
    [
      [underOnePercent, R.constant('<1%')],
      [almostAll, R.constant('>99%')],
    ],
    toPercent(share, 0),
    share,
  )
}
