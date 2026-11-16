import * as R from 'remeda'
import { filter, map, some, type Option } from '@ontologyio/receta/option'
import { and, isFiniteNumber, neq } from '@ontologyio/receta/predicate'

// A base must be a real number other than zero for a change to be measured against it.
const isUsableBase: (value: number) => boolean = and(isFiniteNumber, neq(0))

export type GrowthRatePeriods = {
  /** The value in the earlier period, the base the change is measured against. */
  readonly previous: number
  /** The value in the later period. */
  readonly current: number
}

/**
 * Computes the change from a previous value to a current one as a ratio: 200 → 250 is `0.25`.
 *
 * Use when: a dashboard compares this month with last month, or a price with yesterday's.
 * Returns `None` when the previous value is zero, where growth has no meaning, instead of
 * `Infinity` or `NaN`, and when either value isn't a finite number. The change is divided
 * by the size of the previous value, so going from −100 to −50 counts as growth (`0.5`).
 *
 * @example
 * ```ts
 * growthRate({ previous: 200, current: 250 })
 * // => Some(0.25)
 *
 * growthRate({ previous: 80, current: 60 })
 * // => Some(-0.25)
 *
 * growthRate({ previous: 0, current: 40 })
 * // => None
 *
 * growthRate({ previous: -100, current: -50 })
 * // => Some(0.5)
 * ```
 *
 * @tags growth, change, percent change, delta, trend, month over month, kpi, ratio
 * @see filter - @ontologyio/receta/option, drops a zero base
 * @see formatPercentChange - shows the ratio as `+25.0%`
 */
export function growthRate({ previous, current }: GrowthRatePeriods): Option<number> {
  return R.pipe(
    some(previous),
    filter(isUsableBase),
    map((base) => (current - base) / Math.abs(base)),
    filter<number>(isFiniteNumber),
  )
}
