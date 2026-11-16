import * as R from 'remeda'
import { gte, lte } from '@ontologyio/receta/predicate'
import { round, toCurrency } from '@ontologyio/receta/number'
import { finite, flatMap, fromPredicate, validate, type Validation } from '@ontologyio/receta/validation'

export type ValidateMoneyAmountRules = {
  /** ISO 4217 code such as `USD`, `JPY` or `KWD`. It sets the decimals allowed and the message format. */
  readonly currency: string
  /** Smallest amount allowed. Defaults to the currency's smallest unit, such as 0.01 for USD. */
  readonly min?: number
  /** Largest amount allowed. */
  readonly max?: number
}

/** 2 for USD, 0 for JPY, 3 for KWD, as Intl knows them. */
const minorUnits = (currency: string): number =>
  new Intl.NumberFormat('en', { style: 'currency', currency }).resolvedOptions().maximumFractionDigits ?? 2

/**
 * Checks a money amount: a real number, inside the limits, with no more decimals than the currency has.
 *
 * Use when: a payment, refund, invoice or transfer form takes an amount, and `19.999` dollars
 * or `0` must be refused before it reaches a payment provider. The decimals follow the
 * currency, so `1.5` is refused for JPY and `1.005` is fine for KWD. Limits in messages are
 * formatted as money, like "$10,000.00". Float noise such as `0.1 + 0.2` doesn't count as an
 * extra decimal, so computed totals pass. The amount comes back unchanged, not rounded. The
 * currency is your configuration, not user input: an unknown code throws, as `Intl` does.
 *
 * @example
 * ```ts
 * validateMoneyAmount(49.99, { currency: 'USD', max: 10000 })
 * // => Valid(49.99)
 *
 * validateMoneyAmount(12000.555, { currency: 'USD', max: 10000 })
 * // => Invalid(['Amount must be at most $10,000.00', 'Use at most 2 decimal places'])
 *
 * validateMoneyAmount(0.1 + 0.2, { currency: 'USD' })
 * // => Valid(0.30000000000000004)
 *
 * R.pipe(0, validateMoneyAmount({ currency: 'JPY' }))
 * // => Invalid(['Amount must be at least ¥1'])
 *
 * validateMoneyAmount(Number.NaN, { currency: 'EUR' })
 * // => Invalid(['Enter an amount'])
 * ```
 *
 * @tags money, amount, price, currency, payment, refund, decimals, cents, form
 * @see toCurrency - @ontologyio/receta/number, formats the limits in messages
 * @see round - @ontologyio/receta/number, the decimal places check
 */
export function validateMoneyAmount(amount: number, rules: ValidateMoneyAmountRules): Validation<number, string>
export function validateMoneyAmount(rules: ValidateMoneyAmountRules): (amount: number) => Validation<number, string>
export function validateMoneyAmount(...args: unknown[]): unknown {
  return R.purry(validateMoneyAmountImplementation, args)
}

const validateMoneyAmountImplementation = (amount: number, rules: ValidateMoneyAmountRules): Validation<number, string> => {
  const decimals = minorUnits(rules.currency)
  const smallest = rules.min ?? 10 ** -decimals
  const money = toCurrency({ currency: rules.currency })
  // Float noise, as in 0.1 + 0.2, isn't a third decimal: allow a difference far below a cent.
  const hasAllowedDecimals = (value: number): boolean => Math.abs(round(value, decimals) - value) <= Math.abs(value) * 1e-12
  return R.pipe(
    amount,
    finite('Enter an amount'),
    flatMap(
      validate([
        fromPredicate(gte(smallest), `Amount must be at least ${money(smallest)}`),
        ...(rules.max === undefined ? [] : [fromPredicate(lte(rules.max), `Amount must be at most ${money(rules.max)}`)]),
        fromPredicate(hasAllowedDecimals, decimals === 0 ? 'Use a whole amount' : `Use at most ${decimals} decimal places`),
      ]),
    ),
  )
}
