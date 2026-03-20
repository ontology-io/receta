import { instrumentedPurry } from '../../utils'

/**
 * Constrains a number to be within a specified range.
 *
 * If the value is less than min, returns min.
 * If the value is greater than max, returns max.
 * Otherwise, returns the value unchanged.
 *
 * @param value - The number to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns The clamped value
 *
 * @example
 * ```typescript
 * // Data-first
 * clamp(50, 0, 100) // => 50
 * clamp(150, 0, 100) // => 100
 * clamp(-10, 0, 100) // => 0
 *
 * // Data-last (in pipe)
 * pipe(
 *   userInput,
 *   clamp(0, 100)
 * ) // => constrained to 0-100
 *
 * // Real-world: Volume control
 * const setVolume = (level: number) =>
 *   pipe(level, clamp(0, 100))
 * ```
 *
 * @see inRange - for checking if a value is in range
 */
export function clamp(value: number, min: number, max: number): number
export function clamp(min: number, max: number): (value: number) => number
export function clamp(...args: unknown[]): unknown {
  return instrumentedPurry('clamp', 'number', clampImpl, args)
}

function clampImpl(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}
