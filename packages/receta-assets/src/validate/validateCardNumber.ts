import * as R from 'remeda'
import { sum } from '@ontologyio/receta/number'
import { between, by } from '@ontologyio/receta/predicate'
import { flatMap, fromPredicate, matches, required, validate, type Validation } from '@ontologyio/receta/validation'

/** Doubles every second digit from the right, as the Luhn checksum does. */
const luhnDigit = (char: string, fromRight: number): number => {
  const digit = Number(char)
  if (fromRight % 2 === 0) return digit
  const doubled = digit * 2
  return doubled > 9 ? doubled - 9 : doubled
}

const passesLuhn = (digits: string): boolean => sum(R.pipe(digits.split(''), R.reverse(), R.map(luhnDigit))) % 10 === 0

/**
 * Checks a payment card number's shape and Luhn checksum, and returns its digits without spaces.
 *
 * Use when: a checkout form takes a card number and should catch a mistyped digit before the
 * payment provider's round trip. Spaces and dashes are dropped first. The checksum only runs
 * once the number has 12 to 19 digits and nothing else, so a typo gives one clear message.
 * It doesn't say whether the card exists or what network it is; only the provider knows.
 *
 * @example
 * ```ts
 * validateCardNumber('4242 4242 4242 4242')
 * // => Valid('4242424242424242')
 *
 * validateCardNumber('4242-4242-4242-4241')
 * // => Invalid(['Check the card number for typos'])
 *
 * validateCardNumber('4242 abcd')
 * // => Invalid(['Use only digits', 'Card numbers have 12 to 19 digits'])
 *
 * validateCardNumber('')
 * // => Invalid(['Enter your card number'])
 * ```
 *
 * @tags card, credit, debit, payment, luhn, checksum, checkout, pan
 * @see sum - @ontologyio/receta/number, adds the checksum digits
 */
export function validateCardNumber(input: string): Validation<string, string> {
  return R.pipe(
    input.replace(/[\s-]/g, ''),
    required('Enter your card number'),
    flatMap(
      validate([
        matches(/^\d*$/, 'Use only digits'),
        fromPredicate(by((digits: string) => digits.length, between(12, 19)), 'Card numbers have 12 to 19 digits'),
      ]),
    ),
    // A checksum on a number of the wrong shape would only repeat what is already said.
    flatMap(fromPredicate(passesLuhn, 'Check the card number for typos')),
  )
}
