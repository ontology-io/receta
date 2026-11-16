/**
 * Decimal helpers shared by `round` and `roundTo`.
 *
 * A number like 1.005 is stored as 1.00499999999999989…, so arithmetic such as
 * `1.005 * 100` gives 100.49999999999999 and rounds the wrong way. Moving the decimal
 * point through the number's text keeps the decimal that was written.
 *
 * @module number/decimal
 */

/**
 * Moves the decimal point `places` to the right (to the left when negative).
 *
 * @example
 * ```typescript
 * shiftDecimal(1.005, 2) // => 100.5 (1.005 * 100 is 100.49999999999999)
 * shiftDecimal(101, -2) // => 1.01
 * ```
 */
export function shiftDecimal(value: number, places: number): number {
  // String(value) can already carry an exponent: 1e21 is '1e+21' and 5e-7 is '5e-7'
  const [mantissa = '0', exponent = '0'] = String(value).split('e')

  return Number(`${mantissa}e${Number(exponent) + places}`)
}

/**
 * Counts the digits after the decimal point in the number as written.
 *
 * @example
 * ```typescript
 * decimalPlaces(0.05) // => 2
 * decimalPlaces(1.5e-7) // => 8
 * decimalPlaces(1200) // => 0
 * ```
 */
export function decimalPlaces(value: number): number {
  const [mantissa = '', exponent = '0'] = String(Math.abs(value)).split('e')
  const fraction = mantissa.split('.')[1] ?? ''

  return Math.max(0, fraction.length - Number(exponent))
}

/**
 * Rounds to the nearest integer, with a half going away from zero: 2.5 is 3 and -2.5 is -3.
 * A result of zero is always positive zero.
 */
export function roundHalfAwayFromZero(value: number): number {
  const rounded = Math.round(Math.abs(value))

  return rounded === 0 ? 0 : Math.sign(value) * rounded
}
