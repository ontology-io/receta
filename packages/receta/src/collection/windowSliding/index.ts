import type { WindowSlidingConfig } from '../types'
import { instrumentedPurry } from '../../utils'

/**
 * Creates a sliding window over an array with configurable size and step.
 *
 * A sliding window creates overlapping sub-arrays by moving a fixed-size window
 * across the array. Useful for moving averages, n-gram analysis, pattern detection,
 * and time-series analysis.
 *
 * @param items - The array to window over
 * @param config - Window size and optional step configuration
 * @returns Array of windows (sub-arrays)
 *
 * @example
 * ```typescript
 * // Data-first: Simple sliding window (step=1)
 * windowSliding([1, 2, 3, 4, 5], { size: 3 })
 * // => [[1, 2, 3], [2, 3, 4], [3, 4, 5]]
 *
 * // Sliding window with step
 * windowSliding([1, 2, 3, 4, 5, 6], { size: 3, step: 2 })
 * // => [[1, 2, 3], [3, 4, 5]]
 *
 * // Moving average calculation
 * const prices = [100, 102, 101, 105, 103, 107]
 * pipe(
 *   prices,
 *   windowSliding({ size: 3 }),
 *   R.map(window => window.reduce((a, b) => a + b, 0) / window.length)
 * )
 * // => [101, 102.67, 103, 105]
 *
 * // N-gram analysis
 * const words = ['the', 'quick', 'brown', 'fox', 'jumps']
 * windowSliding(words, { size: 2 })
 * // => [['the', 'quick'], ['quick', 'brown'], ['brown', 'fox'], ['fox', 'jumps']]
 *
 * // Pattern detection (3-item sequences)
 * const sequence = [1, 2, 3, 2, 3, 4, 3, 4, 5]
 * pipe(
 *   sequence,
 *   windowSliding({ size: 3 }),
 *   R.filter(window => window[0]! < window[1]! && window[1]! < window[2]!)
 * )
 * // => [[1, 2, 3], [2, 3, 4], [3, 4, 5]]
 *
 * // Data-last (in pipe)
 * pipe(
 *   [1, 2, 3, 4, 5],
 *   windowSliding({ size: 3 })
 * )
 * // => [[1, 2, 3], [2, 3, 4], [3, 4, 5]]
 * ```
 *
 * @see chunk - for non-overlapping fixed-size batches
 * @see batchBy - for grouping consecutive items by predicate
 */
export function windowSliding<T>(
  items: readonly T[],
  config: WindowSlidingConfig
): readonly (readonly T[])[]
export function windowSliding<T>(
  config: WindowSlidingConfig
): (items: readonly T[]) => readonly (readonly T[])[]
export function windowSliding(...args: unknown[]): unknown {
  return instrumentedPurry('windowSliding', 'collection', windowSlidingImplementation, args)
}

function windowSlidingImplementation<T>(
  items: readonly T[],
  config: WindowSlidingConfig
): readonly (readonly T[])[] {
  const { size, step = 1 } = config

  if (size <= 0) {
    return []
  }

  if (items.length < size) {
    return []
  }

  const windows: T[][] = []

  for (let i = 0; i <= items.length - size; i += step) {
    windows.push(items.slice(i, i + size) as T[])
  }

  return windows
}
