/**
 * A comparator function for sorting values of type T.
 *
 * Returns:
 * - Negative number if a should come before b
 * - Zero if a and b are equal
 * - Positive number if a should come after b
 *
 * @typeParam T - The type of values being compared
 *
 * @example
 * ```typescript
 * const numericComparator: Comparator<number> = (a, b) => a - b
 * [3, 1, 2].sort(numericComparator) // => [1, 2, 3]
 * ```
 */
export type Comparator<T> = (a: T, b: T) => number

/**
 * Options for string comparison.
 */
export interface StringCompareOptions {
  /**
   * Whether comparison should be case-sensitive.
   * @default true
   */
  readonly caseSensitive?: boolean

  /**
   * Locale to use for comparison (e.g., 'en-US', 'fr-FR').
   * @default undefined (uses default locale)
   */
  readonly locale?: string
}

/**
 * Represents a value that may be null or undefined.
 */
export type Nullable<T> = T | null | undefined

/**
 * Helper type for extracting a comparable value from T.
 */
export type ComparableExtractor<T, C = any> = (value: T) => C
