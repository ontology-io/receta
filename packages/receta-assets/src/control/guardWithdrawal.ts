import { guard } from '@ontologyio/receta/function'
import { and, gt, isInteger, lte, where } from '@ontologyio/receta/predicate'
import type { Result } from '@ontologyio/receta/result'

/** Every amount is in the currency's smallest unit, such as cents, so it is a whole number. */
export type GuardWithdrawalRequest = {
  readonly amount: number
  readonly balance: number
  readonly dailyLimit: number
  /** What has already left the account today, before this withdrawal. */
  readonly withdrawnToday: number
}

export type GuardWithdrawalError = {
  readonly code: 'INVALID_AMOUNT' | 'INSUFFICIENT_FUNDS' | 'DAILY_LIMIT_REACHED'
  readonly input: GuardWithdrawalRequest
  readonly message: string
}

/**
 * Approves a withdrawal or transfer only if the amount is valid, covered by the balance and within today's limit.
 *
 * Use when: money is about to leave an account, a wallet or a prepaid balance, and the caller
 * needs one reason to show when it can't. Checks run in order: the amount must be a whole,
 * positive number of minor units (cents), then no more than the balance, then no more than
 * what is left of the daily limit. The `Ok` holds the request unchanged, for the next step.
 *
 * @example
 * ```ts
 * const account = { balance: 25_000, dailyLimit: 50_000, withdrawnToday: 45_000 }
 *
 * guardWithdrawal({ ...account, amount: 4_000 })
 * // => Ok({ balance: 25_000, dailyLimit: 50_000, withdrawnToday: 45_000, amount: 4_000 })
 *
 * guardWithdrawal({ ...account, amount: 30_000 })
 * // => Err({ code: 'INSUFFICIENT_FUNDS', input: { balance: 25_000, dailyLimit: 50_000, withdrawnToday: 45_000, amount: 30_000 }, message: 'The balance is 25000, the withdrawal is 30000' })
 *
 * guardWithdrawal({ ...account, amount: 6_000 })
 * // => Err({ code: 'DAILY_LIMIT_REACHED', input: { balance: 25_000, dailyLimit: 50_000, withdrawnToday: 45_000, amount: 6_000 }, message: '5000 is left of today\'s limit of 50000' })
 *
 * guardWithdrawal({ ...account, amount: 12.5 })
 * // => Err({ code: 'INVALID_AMOUNT', input: { balance: 25_000, dailyLimit: 50_000, withdrawnToday: 45_000, amount: 12.5 }, message: 'The amount must be a whole number of cents above 0, got 12.5' })
 * ```
 *
 * @tags withdrawal, transfer, payment, balance, limit, wallet, money, guard, funds
 * @see guard - @ontologyio/receta/function, the checks in order with the first failure
 * @see guardInput - the same gate for any value and any checks
 */
export function guardWithdrawal(
  request: GuardWithdrawalRequest,
): Result<GuardWithdrawalRequest, GuardWithdrawalError> {
  const { amount, balance, dailyLimit, withdrawnToday } = request
  const refuse = (code: GuardWithdrawalError['code'], message: string): GuardWithdrawalError => ({
    code,
    input: request,
    message,
  })
  const leftToday = Math.max(dailyLimit - withdrawnToday, 0)
  return guard(
    [
      [
        where<GuardWithdrawalRequest>({ amount: and(isInteger, gt(0)) }),
        refuse('INVALID_AMOUNT', `The amount must be a whole number of cents above 0, got ${amount}`),
      ],
      [
        where<GuardWithdrawalRequest>({ amount: lte(balance) }),
        refuse('INSUFFICIENT_FUNDS', `The balance is ${balance}, the withdrawal is ${amount}`),
      ],
      [
        where<GuardWithdrawalRequest>({ amount: lte(leftToday) }),
        refuse('DAILY_LIMIT_REACHED', `${leftToday} is left of today's limit of ${dailyLimit}`),
      ],
    ],
    request,
  )
}
