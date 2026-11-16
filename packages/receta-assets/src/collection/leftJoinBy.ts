import * as R from 'remeda'
import { flatMap, fromNullable, type Option } from '@ontologyio/receta/option'

export type LeftJoinByRow<TLeft, TRight> = {
  readonly left: TLeft
  /** The first right item whose key matches, or `None`. */
  readonly right: Option<TRight>
}

/**
 * Pairs each item of one list with the matching item of another, by keys that can differ on each side.
 *
 * Use when: showing orders with their customer, line items with their product, or events with
 * their user, when the two lists came from separate requests. Every left item comes back, in
 * order, with `None` when nothing matches, as in a SQL left join. When several right items
 * match, the first one wins. Keys compare as strings, so `7` and `'7'` match.
 *
 * @example
 * ```ts
 * import { map, unwrapOr } from '@ontologyio/receta/option'
 *
 * const orders = [
 *   { id: 'o1', customerId: 7 },
 *   { id: 'o2', customerId: 9 },
 * ]
 * const customers = [{ id: 7, name: 'Ana' }]
 *
 * R.pipe(
 *   leftJoinBy(orders, customers, (order) => order.customerId, (customer) => customer.id),
 *   R.map(({ left, right }) => ({
 *     order: left.id,
 *     customer: R.pipe(right, map((customer) => customer.name), unwrapOr('unknown')),
 *   })),
 * )
 * // => [{ order: 'o1', customer: 'Ana' }, { order: 'o2', customer: 'unknown' }]
 *
 * const pairs = [{ sku: 'A' }]
 * const prices = [{ sku: 'A', eur: 5 }, { sku: 'A', eur: 6 }]
 * R.pipe(pairs, leftJoinBy(prices, (pair) => pair.sku, (price) => price.sku))
 * // => [{ left: { sku: 'A' }, right: Some({ sku: 'A', eur: 5 }) }]
 * ```
 *
 * @tags join, left join, lookup, relate, foreign key, enrich, attach, merge lists, populate
 * @see reconcileById - which ids each side has, rather than a lookup
 * @see fromNullable - @ontologyio/receta/option, the match that may be missing
 */
export function leftJoinBy<TLeft, TRight>(
  left: readonly TLeft[],
  right: readonly TRight[],
  leftKey: (item: TLeft) => string | number,
  rightKey: (item: TRight) => string | number,
): readonly LeftJoinByRow<TLeft, TRight>[]
export function leftJoinBy<TLeft, TRight>(
  right: readonly TRight[],
  leftKey: (item: TLeft) => string | number,
  rightKey: (item: TRight) => string | number,
): (left: readonly TLeft[]) => readonly LeftJoinByRow<TLeft, TRight>[]
export function leftJoinBy(...args: unknown[]): unknown {
  return R.purry(leftJoinByImplementation, args)
}

const leftJoinByImplementation = <TLeft, TRight>(
  left: readonly TLeft[],
  right: readonly TRight[],
  leftKey: (item: TLeft) => string | number,
  rightKey: (item: TRight) => string | number,
): readonly LeftJoinByRow<TLeft, TRight>[] => {
  // Each group keeps input order, so its first item is the first match.
  const rightByKey = R.groupBy(right, (item) => String(rightKey(item)))
  return R.map(left, (item) => ({
    left: item,
    right: flatMap(fromNullable(rightByKey[String(leftKey(item))]), (group) => fromNullable(R.first(group))),
  }))
}
