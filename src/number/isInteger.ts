/**
 * Type guard to check if a value is a safe integer.
 *
 * Returns true if the value is an integer within JavaScript's safe integer range
 * (Number.MIN_SAFE_INTEGER to Number.MAX_SAFE_INTEGER).
 *
 * @param value - The value to check
 * @returns True if the value is a safe integer
 *
 * @example
 * ```typescript
 * isInteger(42) // => true
 * isInteger(42.5) // => false
 * isInteger(Number.MAX_SAFE_INTEGER) // => true
 * isInteger(Number.MAX_SAFE_INTEGER + 1) // => false
 * ```
 *
 * @see isFinite - for checking if a number is finite
 * @see inRange - for checking if a number is within a range
 */
export function isInteger(value: number): boolean {
  return Number.isSafeInteger(value)
}
