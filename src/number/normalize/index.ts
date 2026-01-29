import * as R from 'remeda'

/**
 * Scales a number from a given range to the 0-1 range.
 *
 * Useful for data visualization, progress bars, animations,
 * and machine learning feature scaling.
 *
 * @param value - The number to normalize
 * @param min - Minimum value of the input range
 * @param max - Maximum value of the input range
 * @returns The normalized value between 0 and 1
 *
 * @example
 * ```typescript
 * // Data-first
 * normalize(75, 0, 100) // => 0.75
 * normalize(50, 0, 100) // => 0.5
 * normalize(5, 0, 10) // => 0.5
 * normalize(0, 0, 100) // => 0
 * normalize(100, 0, 100) // => 1
 *
 * // Data-last (in pipe)
 * pipe(
 *   currentValue,
 *   normalize(minValue, maxValue)
 * )
 *
 * // Real-world: Progress bar
 * const progressPercentage = (current: number, total: number) =>
 *   pipe(current, normalize(0, total), (n) => n * 100)
 *
 * // Real-world: Feature scaling for ML
 * const scaleFeature = (values: number[]) => {
 *   const min = Math.min(...values)
 *   const max = Math.max(...values)
 *   return R.map(values, normalize(min, max))
 * }
 * ```
 *
 * @see interpolate - for the inverse operation
 */
export function normalize(value: number, min: number, max: number): number
export function normalize(
  min: number,
  max: number
): (value: number) => number
export function normalize(...args: any[]): any {
  // Data-first: normalize(value, min, max) - requires 3 args
  if (args.length >= 3) {
    return normalizeImpl(args[0], args[1], args[2])
  }

  // Data-last: normalize(min, max) - requires 2 args
  if (args.length === 2) {
    const [min, max] = args
    return (value: number) => normalizeImpl(value, min, max)
  }

  throw new Error('normalize requires 2 or 3 arguments')
}

function normalizeImpl(value: number, min: number, max: number): number {
  // Handle edge case where min === max
  if (min === max) {
    return 0
  }

  return (value - min) / (max - min)
}
