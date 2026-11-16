import * as R from 'remeda'
import { flatMap, fromPredicate, integer, max, min, validate, type Validation } from '@ontologyio/receta/validation'

export type ValidateQuantityRules = {
  /** Fewest units allowed. */
  readonly min: number
  /** Most units allowed, such as the stock left or a per-order limit. */
  readonly max: number
  /** Units come in packs of this size. Defaults to 1. */
  readonly step?: number
}

/**
 * Checks an order quantity: a whole number, within the limits, and a multiple of the pack size.
 *
 * Use when: a cart, order or booking form takes a quantity, and limits such as "at most 10
 * per customer" or "sold in packs of 6" must be explained to the buyer. A quantity that is
 * not a whole number reports only that. Otherwise every broken limit is listed.
 *
 * @example
 * ```ts
 * validateQuantity(12, { min: 6, max: 48, step: 6 })
 * // => Valid(12)
 *
 * validateQuantity(50, { min: 6, max: 48, step: 6 })
 * // => Invalid(['Order at most 48', 'Order in multiples of 6'])
 *
 * R.pipe(1.5, validateQuantity({ min: 1, max: 10 }))
 * // => Invalid(['Enter a whole number'])
 * ```
 *
 * @tags quantity, cart, order, stock, limit, pack, step, multiple, checkout
 * @see integer - @ontologyio/receta/validation, the whole-number check that gates the others
 */
export function validateQuantity(quantity: number, rules: ValidateQuantityRules): Validation<number, string>
export function validateQuantity(rules: ValidateQuantityRules): (quantity: number) => Validation<number, string>
export function validateQuantity(...args: unknown[]): unknown {
  return R.purry(validateQuantityImplementation, args)
}

const validateQuantityImplementation = (quantity: number, rules: ValidateQuantityRules): Validation<number, string> => {
  const step = rules.step ?? 1
  return R.pipe(
    quantity,
    integer('Enter a whole number'),
    flatMap(
      validate([
        min(rules.min, `Order at least ${rules.min}`),
        max(rules.max, `Order at most ${rules.max}`),
        fromPredicate((units: number) => units % step === 0, `Order in multiples of ${step}`),
      ]),
    ),
  )
}
