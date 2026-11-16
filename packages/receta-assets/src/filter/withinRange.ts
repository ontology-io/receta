import * as R from 'remeda'
import { always, and, by, gte, isFiniteNumber, lte, type Predicate } from '@ontologyio/receta/predicate'

export type WithinRangeBounds = {
  /** Lowest value kept, inclusive. No lower limit when absent. */
  readonly min?: number | undefined
  /** Highest value kept, inclusive. No upper limit when absent. */
  readonly max?: number | undefined
}

/**
 * Builds a predicate for a number range where either end may be left open, as range filters allow.
 *
 * Use when: a shop, listing or report has "min" and "max" inputs, such as price, rating, size
 * or year, and either input may be empty. Both ends are inclusive. Items whose value is
 * missing, `NaN` or infinite are dropped once any bound is set; with no bounds, everything is
 * kept. Pass the bounds you already parsed from the form or query.
 *
 * @example
 * ```ts
 * const products = [{ name: 'Mug', price: 12 }, { name: 'Lamp', price: 40 }, { name: 'Desk', price: 250 }]
 *
 * R.map(R.filter(products, withinRange((product) => product.price, { min: 20, max: 100 })), R.prop('name'))
 * // => ['Lamp']
 *
 * R.map(R.filter(products, withinRange((product) => product.price, { max: 40 })), R.prop('name'))
 * // => ['Mug', 'Lamp']
 *
 * R.filter(products, withinRange((product) => product.price, {})).length
 * // => 3
 * ```
 *
 * @tags range, min, max, price, between, bounds, numeric, facet, slider
 * @see between - @ontologyio/receta/predicate, both ends required
 * @see isWithinTimeRange - the same for timestamps, with the end left out
 */
export function withinRange<T>(select: (item: T) => number | null | undefined, bounds: WithinRangeBounds): Predicate<T> {
  const limits = [
    ...(bounds.min === undefined ? [] : [gte(bounds.min)]),
    ...(bounds.max === undefined ? [] : [lte(bounds.max)]),
  ]
  if (R.isEmpty(limits)) return always<T>()
  const inBounds = and(...limits)
  return by(select, (value) => isFiniteNumber(value) && inBounds(value))
}
