import { extract, normalizeWhitespace } from '@ontologyio/receta/string'

const VISIBLE_DIGITS = 4
// A digit with at least four more digits after it, whatever punctuation sits between.
const BEFORE_LAST_FOUR = /\d(?=(?:\D*\d){4})/g
const ANY_DIGIT = /\d/g

/**
 * Hides every digit of a phone number but the last four, keeping its punctuation in place.
 *
 * Use when: confirming where an SMS code went, or listing contacts in a support tool,
 * where the last digits are enough to recognize the number. Spaces, brackets, dashes and
 * the `+` stay, so the masked number keeps its familiar shape. A value with four digits
 * or fewer is masked completely, since showing four would show all of it.
 *
 * @example
 * ```ts
 * maskPhone('+1 (555) 123-4567')
 * // => '+• (•••) •••-4567'
 *
 * maskPhone('020  7946 0018')
 * // => '••• •••• 0018'
 *
 * maskPhone('1234')
 * // => '••••'
 * ```
 *
 * @tags mask, phone, redact, privacy, pii, sms, telephone
 * @see extract - @ontologyio/receta/string, counts the digits
 * @see maskEmail - the same idea for email addresses
 * @see maskCardNumber - card numbers, shown as the last four only
 */
export function maskPhone(phone: string): string {
  const tidy = normalizeWhitespace(phone)
  const digits = extract(tidy, ANY_DIGIT)
  return digits.length > VISIBLE_DIGITS ? tidy.replace(BEFORE_LAST_FOUR, '•') : tidy.replace(ANY_DIGIT, '•')
}
