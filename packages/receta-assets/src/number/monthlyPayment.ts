import * as R from 'remeda'
import { round } from '@ontologyio/receta/number'
import { and, gte, isFiniteNumber, isInteger, where } from '@ontologyio/receta/predicate'
import { err, ok, type Result } from '@ontologyio/receta/result'

export type MonthlyPaymentTerms = {
  /** The yearly interest rate as a fraction, so 6% is `0.06`. */
  readonly annualRate: number
  /** How many monthly payments, at least 1. */
  readonly months: number
}

export type MonthlyPaymentError = {
  readonly code: 'INVALID_TERMS'
  readonly input: MonthlyPaymentTerms
  readonly message: string
}

const isValidTerms = where<MonthlyPaymentTerms>({
  annualRate: and(isFiniteNumber, gte(0)),
  months: and(isInteger, gte(1)),
})

/**
 * Computes the fixed monthly payment that pays off a loan, in minor units: an annuity.
 *
 * Use when: a loan, lease, mortgage or buy-now-pay-later screen shows what each month
 * costs. The principal is in minor units, such as cents, and so is the payment, rounded to
 * the nearest one; lenders adjust the last payment by the few cents rounding leaves. A
 * rate of zero divides the principal evenly. The rate must be a finite number of at least
 * zero and the months a whole number of at least 1, or the terms come back as an error.
 *
 * @example
 * ```ts
 * monthlyPayment(2_000_000, { annualRate: 0.06, months: 60 })
 * // => Ok(38666)
 *
 * R.pipe(120_000, monthlyPayment({ annualRate: 0, months: 12 }))
 * // => Ok(10000)
 *
 * monthlyPayment(500_000, { annualRate: 0.05, months: 0 })
 * // => Err({ code: 'INVALID_TERMS', input: { annualRate: 0.05, months: 0 }, message: 'Need a rate of at least 0 and at least 1 whole month' })
 * ```
 *
 * @tags loan, mortgage, annuity, installment, payment, interest, amortization, finance, pmt
 * @see round - @ontologyio/receta/number, rounds the payment to a whole minor unit
 * @see where - @ontologyio/receta/predicate, checks the terms
 */
export function monthlyPayment(principal: number, terms: MonthlyPaymentTerms): Result<number, MonthlyPaymentError>
export function monthlyPayment(terms: MonthlyPaymentTerms): (principal: number) => Result<number, MonthlyPaymentError>
export function monthlyPayment(...args: unknown[]): unknown {
  return R.purry(monthlyPaymentImplementation, args)
}

const monthlyPaymentImplementation = (
  principal: number,
  terms: MonthlyPaymentTerms,
): Result<number, MonthlyPaymentError> => {
  if (!isValidTerms(terms))
    return err({ code: 'INVALID_TERMS', input: terms, message: 'Need a rate of at least 0 and at least 1 whole month' })
  const { annualRate, months } = terms
  const monthlyRate = annualRate / 12
  const exact =
    monthlyRate === 0 ? principal / months : (principal * monthlyRate) / (1 - (1 + monthlyRate) ** -months)
  return ok(round(exact, 0))
}
