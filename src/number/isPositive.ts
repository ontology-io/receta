/**
 * Type guard to check if a number is positive.
 *
 * Returns true if the value is greater than zero.
 *
 * @param value - The number to check
 * @returns True if the number is positive
 *
 * @example
 * ```typescript
 * isPositive(42) // => true
 * isPositive(0) // => false
 * isPositive(-5) // => false
 * ```
 *
 * @see isNegative - for checking if a number is negative
 */
export function isPositive(value: number): boolean {
  return value > 0
}
