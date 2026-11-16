import * as R from 'remeda'
import { fromNullable, isNone, match } from '@ontologyio/receta/option'
import { by, isDefined, not } from '@ontologyio/receta/predicate'

export type ReconcileByIdPair<TLeft, TRight> = {
  readonly id: string | number
  readonly left: TLeft
  readonly right: TRight
}

export type ReconcileByIdResult<TLeft, TRight> = {
  /** Records only the left source has, in left order. */
  readonly onlyLeft: readonly TLeft[]
  /** Records only the right source has, in right order. */
  readonly onlyRight: readonly TRight[]
  /** Records both sources have, paired up, in left order. */
  readonly both: readonly ReconcileByIdPair<TLeft, TRight>[]
}

/**
 * Matches the records of two sources by `id`: those only on the left, only on the right, and paired in both.
 *
 * Use when: checking two systems against each other, such as users in the database against
 * customers in Stripe, or an export against an import, to find what is missing on each side.
 * The two sides can hold different shapes, since only `id` is compared. When a side repeats an
 * id, its last copy is the one paired. Ids compare as strings, so `1` and `'1'` match.
 *
 * @example
 * ```ts
 * const crm = [
 *   { id: 'c1', email: 'ana@example.com' },
 *   { id: 'c2', email: 'bo@example.com' },
 * ]
 * const billing = [
 *   { id: 'c2', plan: 'pro' },
 *   { id: 'c3', plan: 'team' },
 * ]
 *
 * reconcileById(crm, billing)
 * // => {
 * //   onlyLeft: [{ id: 'c1', email: 'ana@example.com' }],
 * //   onlyRight: [{ id: 'c3', plan: 'team' }],
 * //   both: [{ id: 'c2', left: { id: 'c2', email: 'bo@example.com' }, right: { id: 'c2', plan: 'pro' } }],
 * // }
 *
 * R.pipe(
 *   crm,
 *   reconcileById(billing),
 *   (result) => [result.onlyLeft.length, result.both.length, result.onlyRight.length],
 * )
 * // => [1, 1, 1]
 * ```
 *
 * @tags reconcile, match, compare sources, sync, join, missing, orphan, audit, venn, id
 * @see diffById - compares two versions of one list, with changed fields
 * @see leftJoinBy - attaches the matching record from another list by any key
 */
export function reconcileById<
  TLeft extends { readonly id: string | number },
  TRight extends { readonly id: string | number },
>(left: readonly TLeft[], right: readonly TRight[]): ReconcileByIdResult<TLeft, TRight>
export function reconcileById<TRight extends { readonly id: string | number }>(
  right: readonly TRight[],
): <TLeft extends { readonly id: string | number }>(left: readonly TLeft[]) => ReconcileByIdResult<TLeft, TRight>
export function reconcileById(...args: unknown[]): unknown {
  return R.purry(reconcileByIdImplementation, args)
}

const reconcileByIdImplementation = <
  TLeft extends { readonly id: string | number },
  TRight extends { readonly id: string | number },
>(
  left: readonly TLeft[],
  right: readonly TRight[],
): ReconcileByIdResult<TLeft, TRight> => {
  const leftById = R.indexBy(left, (item) => String(item.id))
  const rightById = R.indexBy(right, (item) => String(item.id))
  const pairs = R.map(left, (item) => ({ left: item, right: fromNullable(rightById[String(item.id)]) }))
  return {
    onlyLeft: R.pipe(
      pairs,
      R.filter(by((pair) => pair.right, isNone)),
      R.map((pair) => pair.left),
    ),
    onlyRight: R.filter(right, not(by((item: TRight) => leftById[String(item.id)], isDefined))),
    both: R.flatMap(pairs, (pair) =>
      match(pair.right, {
        onSome: (value) => [{ id: pair.left.id, left: pair.left, right: value }],
        onNone: () => [],
      }),
    ),
  }
}
