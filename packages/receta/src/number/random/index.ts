/**
 * Generates a random number within a specified range.
 *
 * Returns a random number between min (inclusive) and max (exclusive).
 * If only one argument is provided, it's treated as max with min defaulting to 0.
 *
 * @param min - Minimum value (inclusive) or maximum if only one arg
 * @param max - Maximum value (exclusive)
 * @returns A random number in the range [min, max)
 *
 * @example
 * ```typescript
 * random(10) // => number between 0 and 10
 * random(5, 10) // => number between 5 and 10
 * random(0, 1) // => number between 0 and 1
 *
 * // Real-world: Random delay for retry backoff
 * const jitter = () => random(0, 1000)
 * const backoffWithJitter = (attempt: number) =>
 *   Math.pow(2, attempt) * 1000 + jitter()
 * ```
 *
 * @see step - for rounding to specific increments
 */
export function random(max: number): number
export function random(min: number, max: number): number
export function random(minOrMax: number, max?: number): number {
  if (max === undefined) {
    return Math.random() * minOrMax
  }
  return minOrMax + Math.random() * (max - minOrMax)
}
