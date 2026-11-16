import * as R from 'remeda'
import { ascending, compose } from '@ontologyio/receta/compare'

/**
 * Sorts items by how close a number of theirs is to a target, closest first, with the lower value first on a tie.
 *
 * Use when: suggesting the products nearest a budget, the shoe sizes next to the one that's out
 * of stock, the time slots nearest a requested time, or the plans closest to a usage figure.
 * When two items are equally far above and below the target, the lower one comes first.
 *
 * @example
 * ```ts
 * const laptops = [
 *   { model: 'air', price: 1099 },
 *   { model: 'pro', price: 1999 },
 *   { model: 'book', price: 899 },
 *   { model: 'lite', price: 699 },
 * ]
 *
 * R.pipe(sortByClosestTo(laptops, 1000, (laptop) => laptop.price), R.map(R.prop('model')))
 * // => ['air', 'book', 'lite', 'pro']
 *
 * R.pipe([41, 43, 44, 40], sortByClosestTo(42, R.identity()))
 * // => [41, 43, 40, 44]
 * ```
 *
 * @tags sort, closest, nearest, target, budget, approximate, distance, similar, suggestions
 * @see sortByDistanceFrom - nearest by map position instead of one number
 * @see compose - @ontologyio/receta/compare, distance first, then the value
 */
export function sortByClosestTo<T>(items: readonly T[], target: number, value: (item: T) => number): readonly T[]
export function sortByClosestTo<T>(target: number, value: (item: T) => number): (items: readonly T[]) => readonly T[]
export function sortByClosestTo(...args: unknown[]): unknown {
  return R.purry(sortByClosestToImplementation, args)
}

const sortByClosestToImplementation = <T>(items: readonly T[], target: number, value: (item: T) => number): readonly T[] =>
  R.sort(items, compose(ascending((item: T) => Math.abs(value(item) - target)), ascending(value)))
