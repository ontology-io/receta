/**
 * Number module - Number formatting, validation, calculations, and conversions.
 *
 * Provides practical utilities for working with numbers in real-world applications,
 * including currency formatting, percentage calculations, byte sizes, and more.
 *
 * @module number
 *
 * @example
 * ```typescript
 * import * as N from 'receta/number'
 *
 * // Currency formatting
 * N.toCurrency(1234.56, { currency: 'USD' }) // => "$1,234.56"
 *
 * // Percentage calculations
 * pipe(
 *   N.percentage(25, 100),
 *   N.toPercent(1)
 * ) // => "25.0%"
 *
 * // Byte size formatting
 * N.toBytes(1048576) // => "1.00 MB"
 *
 * // Safe parsing
 * N.fromString("123.45") // => Ok(123.45)
 * ```
 */

// Types
export type {
  ParseError,
  InvalidOperationError,
  FormatOptions,
  CurrencyOptions,
  CompactOptions,
  ByteOptions,
  ByteUnit,
} from './types'

// Validation (Type Guards)
export { isInteger } from './isInteger'
export { isFinite } from './isFinite'
export { isPositive } from './isPositive'
export { isNegative } from './isNegative'
export { inRange } from './inRange'
export { clamp } from './clamp'

// Formatting
export { format } from './format'
export { toCurrency } from './toCurrency'
export { toPercent } from './toPercent'
export { toCompact } from './toCompact'
export { toPrecision } from './toPrecision'
export { toOrdinal } from './toOrdinal'

// Calculations
export { sum } from './sum'
export { average } from './average'
export { round } from './round'
export { percentage } from './percentage'
export { ratio } from './ratio'

// Conversions
export { fromString } from './fromString'
export { fromCurrency } from './fromCurrency'
export { toBytes } from './toBytes'
export { fromBytes } from './fromBytes'

// Utilities
export { random } from './random'
export { step } from './step'
export { interpolate } from './interpolate'
