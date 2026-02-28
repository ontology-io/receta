/**
 * Type guard to check if a value is a finite number.
 *
 * Returns true if the value is a finite number (not Infinity, -Infinity, or NaN).
 *
 * @param value - The value to check
 * @returns True if the value is finite
 *
 * @example
 * ```typescript
 * isFinite(42) // => true
 * isFinite(42.5) // => true
 * isFinite(Infinity) // => false
 * isFinite(-Infinity) // => false
 * isFinite(NaN) // => false
 * ```
 *
 * @see isInteger - for checking if a number is an integer
 */
export function isFinite(value: number): boolean {
  return Number.isFinite(value)
}
