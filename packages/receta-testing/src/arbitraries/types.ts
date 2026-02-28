/**
 * Type definitions for fast-check arbitraries.
 */

/**
 * Configuration for Result arbitrary generation.
 *
 * @example
 * ```typescript
 * result(fc.integer(), fc.string(), { okWeight: 0.8 })
 * // → 80% Ok, 20% Err
 * ```
 */
export interface ResultArbitraryConfig {
  /**
   * Weight for Ok values (0-1).
   * Default: 0.5 (50% Ok, 50% Err)
   *
   * @example
   * ```typescript
   * { okWeight: 0.9 }  // 90% Ok, 10% Err
   * { okWeight: 0.1 }  // 10% Ok, 90% Err
   * ```
   */
  okWeight?: number
}

/**
 * Configuration for Option arbitrary generation.
 *
 * @example
 * ```typescript
 * option(fc.integer(), { someWeight: 0.7 })
 * // → 70% Some, 30% None
 * ```
 */
export interface OptionArbitraryConfig {
  /**
   * Weight for Some values (0-1).
   * Default: 0.5 (50% Some, 50% None)
   *
   * @example
   * ```typescript
   * { someWeight: 0.8 }  // 80% Some, 20% None
   * { someWeight: 0.2 }  // 20% Some, 80% None
   * ```
   */
  someWeight?: number
}
