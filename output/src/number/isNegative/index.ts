/**
 * Type guard to check if a number is negative.
 *
 * Returns true if the value is less than zero.
 *
 * @param value - The number to check
 * @returns True if the number is negative
 *
 * @example
 * ```typescript
 * isNegative(-5) // => true
 * isNegative(0) // => false
 * isNegative(42) // => false
 * ```
 *
 * @see isPositive - for checking if a number is positive
 */
export function isNegative(value: number): boolean {
  return value < 0
}
