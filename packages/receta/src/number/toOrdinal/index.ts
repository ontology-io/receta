import { instrumentedPurry } from '../../utils'

/**
 * Formats a number as an ordinal (1st, 2nd, 3rd, etc.).
 *
 * Adds the appropriate English ordinal suffix to the number.
 *
 * @param value - The number to format as ordinal
 * @returns The formatted ordinal string
 *
 * @example
 * ```typescript
 * // Data-first
 * toOrdinal(1) // => "1st"
 * toOrdinal(2) // => "2nd"
 * toOrdinal(3) // => "3rd"
 * toOrdinal(4) // => "4th"
 * toOrdinal(11) // => "11th"
 * toOrdinal(21) // => "21st"
 * toOrdinal(42) // => "42nd"
 *
 * // Data-last (in pipe)
 * pipe(
 *   position,
 *   toOrdinal
 * )
 *
 * // Real-world: Leaderboard
 * const displayRank = (rank: number) =>
 *   `You placed ${toOrdinal(rank)} out of ${total}`
 * ```
 */
export function toOrdinal(value: number): string
export function toOrdinal(): (value: number) => string
export function toOrdinal(...args: unknown[]): unknown {
  return instrumentedPurry('toOrdinal', 'number', toOrdinalImpl, args)
}

function toOrdinalImpl(value: number): string {
  const num = Math.floor(value)
  const remainder = num % 100

  // Special cases for 11th, 12th, 13th
  if (remainder >= 11 && remainder <= 13) {
    return `${num}th`
  }

  // Check last digit
  const lastDigit = num % 10
  switch (lastDigit) {
    case 1:
      return `${num}st`
    case 2:
      return `${num}nd`
    case 3:
      return `${num}rd`
    default:
      return `${num}th`
  }
}
