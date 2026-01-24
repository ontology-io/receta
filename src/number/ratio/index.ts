import * as R from 'remeda'

/**
 * Calculates the ratio of two numbers.
 *
 * Returns the ratio as a decimal (a / b).
 * Returns 0 if b is 0 to avoid division by zero.
 *
 * @param a - The first number
 * @param b - The second number
 * @returns The ratio (a / b)
 *
 * @example
 * ```typescript
 * // Data-first
 * ratio(4, 2) // => 2
 * ratio(3, 4) // => 0.75
 * ratio(10, 0) // => 0 (safe division)
 *
 * // Data-last (in pipe)
 * pipe(
 *   width,
 *   ratio(height)
 * ) // => aspect ratio
 *
 * // Real-world: Aspect ratio
 * const aspectRatio = (width: number, height: number) =>
 *   pipe(
 *     ratio(width, height),
 *     round(2)
 *   )
 * ```
 */
export function ratio(a: number, b: number): number
export function ratio(b: number): (a: number) => number
export function ratio(...args: unknown[]): unknown {
  return R.purry(ratioImpl, args)
}

function ratioImpl(a: number, b: number): number {
  if (b === 0) return 0
  return a / b
}
