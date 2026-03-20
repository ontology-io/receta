import { instrumentedPurry } from '../../utils'

/**
 * Checks if a number is within a specified range (inclusive).
 *
 * Returns true if the value is between min and max (inclusive).
 * Can be used as a predicate builder for filtering.
 *
 * @param value - The number to check
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns True if the number is within the range
 *
 * @example
 * ```typescript
 * // Data-first
 * inRange(50, 0, 100) // => true
 * inRange(150, 0, 100) // => false
 * inRange(0, 0, 100) // => true
 * inRange(100, 0, 100) // => true
 *
 * // Data-last (as predicate)
 * const ages = [15, 25, 35, 45]
 * R.filter(ages, inRange(18, 65)) // => [25, 35, 45]
 * ```
 *
 * @see clamp - for constraining a value to a range
 */
export function inRange(value: number, min: number, max: number): boolean
export function inRange(
  min: number,
  max: number
): (value: number) => boolean
export function inRange(...args: unknown[]): unknown {
  return instrumentedPurry('inRange', 'number', inRangeImpl, args)
}

function inRangeImpl(value: number, min: number, max: number): boolean {
  return value >= min && value <= max
}
