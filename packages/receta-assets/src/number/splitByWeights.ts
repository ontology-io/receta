import * as R from 'remeda'
import { isInteger, sum } from '@ontologyio/receta/number'
import { and, gte, isFiniteNumber, oneOf } from '@ontologyio/receta/predicate'
import { err, ok, type Result } from '@ontologyio/receta/result'

export type SplitByWeightsError =
  | { readonly code: 'AMOUNT_NOT_INTEGER'; readonly input: number; readonly message: string }
  | { readonly code: 'INVALID_WEIGHTS'; readonly input: readonly number[]; readonly message: string }

const isWeight = and(isFiniteNumber, gte(0))

/**
 * Splits an amount in minor units in proportion to weights, with parts that add up exactly.
 *
 * Use when: allocating a discount across order lines, revenue across partners or a cost
 * across departments, where rounding each part on its own would lose or invent cents. Each
 * part is rounded down, then the cents still missing go to the parts that lost the most in
 * rounding (the largest remainder method); ties go to the earlier part. A negative amount
 * splits the same way with negative parts. Weights must be finite, not negative, and not
 * all zero.
 *
 * ```text
 *  STEP                          DATA AFTER IT
 *  ────────────────────────────  ──────────────────────────────────
 *  amount, weights               1000 cents, [1, 1, 1]
 *  amount × weight ÷ total       [333.33, 333.33, 333.33]
 *  round each down               [333, 333, 333]        1 cent short
 *  +1 to the largest remainders  [334, 333, 333]        sum 1000
 * ```
 *
 * @example
 * ```ts
 * splitByWeights(1000, [1, 1, 1])
 * // => Ok([334, 333, 333])
 *
 * splitByWeights(999, [50, 30, 20])
 * // => Ok([499, 300, 200])
 *
 * R.pipe(-1000, splitByWeights([3, 1]))
 * // => Ok([-750, -250])
 *
 * splitByWeights(1000, [0, 0])
 * // => Err({ code: 'INVALID_WEIGHTS', input: [0, 0], message: 'Weights must be finite, at least 0 and not all 0' })
 * ```
 *
 * @tags allocate, split, proportion, weights, ratio, money, cents, largest remainder, prorate
 * @see sum - @ontologyio/receta/number, the total weight and the cents still missing
 * @see splitEvenly - equal parts, without weights
 * @see percentOfTotal - the same method for percentages
 */
export function splitByWeights(
  amount: number,
  weights: readonly number[],
): Result<readonly number[], SplitByWeightsError>
export function splitByWeights(
  weights: readonly number[],
): (amount: number) => Result<readonly number[], SplitByWeightsError>
export function splitByWeights(...args: unknown[]): unknown {
  return R.purry(splitByWeightsImplementation, args)
}

const splitByWeightsImplementation = (
  amount: number,
  weights: readonly number[],
): Result<readonly number[], SplitByWeightsError> => {
  if (!isInteger(amount))
    return err({ code: 'AMOUNT_NOT_INTEGER', input: amount, message: `Amount must be whole minor units, got ${amount}` })
  const totalWeight = sum(weights)
  if (!weights.every(isWeight) || totalWeight <= 0)
    return err({ code: 'INVALID_WEIGHTS', input: weights, message: 'Weights must be finite, at least 0 and not all 0' })
  const size = Math.abs(amount)
  const exact = R.map(weights, (weight) => (size * weight) / totalWeight)
  const floors = R.map(exact, (part) => Math.floor(part))
  const bumped = R.pipe(
    exact,
    R.map((part, index) => ({ index, remainder: part - Math.floor(part) })),
    R.sortBy([R.prop('remainder'), 'desc']),
    R.take(size - sum(floors)),
    R.map(R.prop('index')),
  )
  // 0 - n keeps a zero part positive, where -1 * 0 would give -0.
  const signed = (part: number): number => (amount < 0 ? 0 - part : part)
  return ok(R.map(floors, (floor, index) => signed(oneOf(bumped)(index) ? floor + 1 : floor)))
}
