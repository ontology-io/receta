import * as R from 'remeda'
import { clamp, round } from '@ontologyio/receta/number'

/** A percentage off, such as `{ percent: 15 }`, or a fixed amount off in minor units. */
export type DiscountedPriceDiscount = { readonly percent: number } | { readonly amount: number }

/**
 * Applies a percentage or fixed discount to a price in minor units, never going below zero.
 *
 * Use when: a cart, a coupon or a sale price takes `15%` or `$5` off. A percentage is
 * clamped to 0–100 and its amount rounded to a whole minor unit, halves up. The price
 * never drops below zero, so a $20 coupon on a $15 item gives 0, and a negative discount
 * never raises the price.
 *
 * @example
 * ```ts
 * discountedPrice(1999, { percent: 15 })
 * // => 1699
 *
 * discountedPrice(1500, { amount: 2000 })
 * // => 0
 *
 * R.pipe(5000, discountedPrice({ percent: 120 }))
 * // => 0
 *
 * discountedPrice(5000, { amount: -300 })
 * // => 5000
 * ```
 *
 * @tags discount, coupon, sale, percent off, price, cart, promo, markdown, money
 * @see clamp - @ontologyio/receta/number, keeps the percent and the result in range
 * @see round - @ontologyio/receta/number, rounds a percentage to a whole minor unit
 */
export function discountedPrice(price: number, discount: DiscountedPriceDiscount): number
export function discountedPrice(discount: DiscountedPriceDiscount): (price: number) => number
export function discountedPrice(...args: unknown[]): unknown {
  return R.purry(discountedPriceImplementation, args)
}

const discountedPriceImplementation = (price: number, discount: DiscountedPriceDiscount): number => {
  const off = 'percent' in discount ? round((price * clamp(discount.percent, 0, 100)) / 100, 0) : discount.amount
  return clamp(price - off, 0, price)
}
