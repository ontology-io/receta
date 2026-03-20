import { instrumentedPurry } from '../../utils'

/**
 * Formats a number to a specified number of significant digits.
 *
 * Uses toPrecision() to format the number with the specified precision.
 *
 * @param value - The number to format
 * @param digits - Number of significant digits
 * @returns The formatted number string
 *
 * @example
 * ```typescript
 * // Data-first
 * toPrecision(123.456, 4) // => "123.5"
 * toPrecision(0.0012345, 3) // => "0.00123"
 * toPrecision(1234567, 3) // => "1.23e+6"
 *
 * // Data-last (in pipe)
 * pipe(
 *   measurementValue,
 *   toPrecision(3)
 * )
 * ```
 *
 * @see round - for rounding to decimal places
 */
export function toPrecision(value: number, digits: number): string
export function toPrecision(digits: number): (value: number) => string
export function toPrecision(...args: unknown[]): unknown {
  return instrumentedPurry('toPrecision', 'number', toPrecisionImpl, args)
}

function toPrecisionImpl(value: number, digits: number): string {
  return value.toPrecision(digits)
}
