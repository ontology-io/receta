/**
 * Number module types and interfaces.
 *
 * @module number/types
 */

/**
 * Error thrown when number parsing fails.
 */
export interface ParseError {
  readonly code: 'PARSE_ERROR'
  readonly message: string
  readonly input: string
}

/**
 * Error thrown when a number operation is invalid.
 */
export interface InvalidOperationError {
  readonly code: 'INVALID_OPERATION'
  readonly message: string
  readonly value?: number
}

/**
 * Options for formatting numbers.
 */
export interface FormatOptions {
  /**
   * Number of decimal places to display.
   * @default 2
   */
  readonly decimals?: number

  /**
   * Whether to use grouping separators (e.g., commas).
   * @default true
   */
  readonly useGrouping?: boolean

  /**
   * Locale to use for formatting.
   * @default 'en-US'
   */
  readonly locale?: string

  /**
   * Minimum number of decimal places.
   */
  readonly minimumFractionDigits?: number

  /**
   * Maximum number of decimal places.
   */
  readonly maximumFractionDigits?: number
}

/**
 * Options for currency formatting.
 */
export interface CurrencyOptions {
  /**
   * Currency code (ISO 4217).
   * @example 'USD', 'EUR', 'GBP'
   */
  readonly currency: string

  /**
   * Locale to use for formatting.
   * @default 'en-US'
   */
  readonly locale?: string

  /**
   * Whether to display the currency symbol.
   * @default true
   */
  readonly showSymbol?: boolean

  /**
   * Number of decimal places.
   * @default 2
   */
  readonly decimals?: number
}

/**
 * Options for compact number formatting (1K, 1M, etc.).
 */
export interface CompactOptions {
  /**
   * Locale to use for formatting.
   * @default 'en-US'
   */
  readonly locale?: string

  /**
   * Number of significant digits.
   * @default 1
   */
  readonly digits?: number

  /**
   * Notation style.
   * @default 'short'
   */
  readonly notation?: 'short' | 'long'
}

/**
 * Byte unit types.
 */
export type ByteUnit = 'B' | 'KB' | 'MB' | 'GB' | 'TB' | 'PB'

/**
 * Options for byte formatting.
 */
export interface ByteOptions {
  /**
   * Number of decimal places.
   * @default 2
   */
  readonly decimals?: number

  /**
   * Use binary (1024) or decimal (1000) units.
   * @default 'binary'
   */
  readonly base?: 'binary' | 'decimal'
}
