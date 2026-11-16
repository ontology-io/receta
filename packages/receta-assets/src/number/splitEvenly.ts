import * as R from 'remeda'
import { isInteger } from '@ontologyio/receta/number'
import { err, ok, type Result } from '@ontologyio/receta/result'

export type SplitEvenlyError = {
  readonly code: 'AMOUNT_NOT_INTEGER' | 'INVALID_PARTS'
  readonly input: number
  readonly message: string
}

/**
 * Splits an amount in minor units into equal parts that add up exactly, spreading the rest.
 *
 * Use when: dividing a bill, a refund or a subscription charge between people or months,
 * where `1000 / 3` must not lose or invent a cent. Every part gets the same share, and the
 * cents left over go one each to the first parts, so parts differ by at most one. A
 * negative amount splits the same way with negative parts. The amount must be whole minor
 * units, such as cents, and `parts` a whole number of at least 1.
 *
 * ```text
 *  amount, parts
 *        │
 *  ⟨ whole amount, parts ≥ 1 ⟩──no──▶ ╭──────────────────────────────────╮
 *        │ yes                        │ Err(AMOUNT_NOT_INTEGER           │
 *        ▼                            │     or INVALID_PARTS)            │
 *  ┌──────────────────────────┐       ╰──────────────────────────────────╯
 *  │ 1000 ÷ 3 = 333 each,     │
 *  │ 1000 − 3 × 333 = 1 left  │
 *  └────────────┬─────────────┘
 *               │ +1 to each of the first 1 parts
 *               ▼
 *       ╭─────────────────────╮
 *       │ Ok([334, 333, 333]) │
 *       ╰─────────────────────╯
 * ```
 *
 * @example
 * ```ts
 * splitEvenly(1000, 3)
 * // => Ok([334, 333, 333])
 *
 * splitEvenly(-500, 4)
 * // => Ok([-125, -125, -125, -125])
 *
 * R.pipe(10.5, splitEvenly(2))
 * // => Err({ code: 'AMOUNT_NOT_INTEGER', input: 10.5, message: 'Amount must be whole minor units, got 10.5' })
 *
 * splitEvenly(1000, 0)
 * // => Err({ code: 'INVALID_PARTS', input: 0, message: 'Parts must be a whole number of at least 1, got 0' })
 * ```
 *
 * @tags split, divide, bill, money, cents, allocate, installments, remainder, share
 * @see isInteger - @ontologyio/receta/number, checks the amount and the parts
 * @see splitByWeights - parts in proportion to weights instead of equal
 */
export function splitEvenly(amount: number, parts: number): Result<readonly number[], SplitEvenlyError>
export function splitEvenly(parts: number): (amount: number) => Result<readonly number[], SplitEvenlyError>
export function splitEvenly(...args: unknown[]): unknown {
  return R.purry(splitEvenlyImplementation, args)
}

const splitEvenlyImplementation = (amount: number, parts: number): Result<readonly number[], SplitEvenlyError> => {
  if (!isInteger(amount))
    return err({ code: 'AMOUNT_NOT_INTEGER', input: amount, message: `Amount must be whole minor units, got ${amount}` })
  if (!isInteger(parts) || parts < 1)
    return err({ code: 'INVALID_PARTS', input: parts, message: `Parts must be a whole number of at least 1, got ${parts}` })
  const size = Math.abs(amount)
  const share = Math.floor(size / parts)
  const leftOver = size - share * parts
  // 0 - n keeps a zero part positive, where -1 * 0 would give -0.
  const signed = (part: number): number => (amount < 0 ? 0 - part : part)
  return ok(R.times(parts, (index) => signed(index < leftOver ? share + 1 : share)))
}
