import * as R from 'remeda'
import { extract } from '@ontologyio/receta/string'

// The shortest card numbers in use have 12 digits; anything shorter isn't a card.
const MIN_CARD_DIGITS = 12

/**
 * Shows a payment card number as `•••• 4242`, the last four digits behind a fixed mask.
 *
 * Use when: listing saved cards, receipts or order details. The mask has the same length
 * for every card, so it hides how many digits there are. Spaces and dashes in the input
 * don't matter. Input with fewer than 12 digits isn't a card number and comes back fully
 * masked as `••••`, so a partial number is never shown.
 *
 * @example
 * ```ts
 * maskCardNumber('4242 4242 4242 4242')
 * // => '•••• 4242'
 *
 * maskCardNumber('3782-822463-10005')
 * // => '•••• 0005'
 *
 * maskCardNumber('4242')
 * // => '••••'
 * ```
 *
 * @tags mask, card, credit card, pan, payment, redact, last four, pci
 * @see extract - @ontologyio/receta/string, pulls the digits out of the input
 * @see maskPhone - keeps the number's shape and masks digits in place
 */
export function maskCardNumber(cardNumber: string): string {
  const digits = extract(cardNumber, /\d/g)
  return digits.length < MIN_CARD_DIGITS ? '••••' : `•••• ${R.join(R.takeLast(digits, 4), '')}`
}
