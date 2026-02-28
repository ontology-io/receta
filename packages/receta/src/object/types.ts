/**
 * Type utilities for object operations.
 *
 * @module object/types
 */

/**
 * Represents a path into a nested object as an array of keys.
 *
 * @example
 * ```typescript
 * const path: ObjectPath = ['user', 'address', 'city']
 * ```
 */
export type ObjectPath = readonly (string | number)[]

/**
 * Makes all properties of T deeply partial (optional).
 *
 * @typeParam T - The type to make deeply partial
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/**
 * Flattened object with dot-notation keys.
 *
 * @example
 * ```typescript
 * const flat: FlatObject = {
 *   'user.name': 'Alice',
 *   'user.age': 30
 * }
 * ```
 */
export type FlatObject = Record<string, unknown>

/**
 * Options for flattening objects.
 */
export interface FlattenOptions {
  /**
   * Separator to use between keys (default: '.').
   */
  readonly separator?: string

  /**
   * Maximum depth to flatten (default: Infinity).
   */
  readonly maxDepth?: number

  /**
   * Whether to flatten arrays (default: false).
   */
  readonly flattenArrays?: boolean
}

/**
 * Options for unflattening objects.
 */
export interface UnflattenOptions {
  /**
   * Separator used between keys (default: '.').
   */
  readonly separator?: string
}

/**
 * Options for deep merging objects.
 */
export interface DeepMergeOptions {
  /**
   * Strategy for handling array conflicts.
   * - 'replace': Replace the target array with source array (default)
   * - 'concat': Concatenate source array to target array
   * - 'merge': Merge arrays by index
   */
  readonly arrayStrategy?: 'replace' | 'concat' | 'merge'

  /**
   * Custom merge function for specific keys.
   */
  readonly customMerge?: (key: string, target: unknown, source: unknown) => unknown
}

/**
 * Error type for object operations.
 */
export interface ObjectError {
  readonly code: 'PATH_NOT_FOUND' | 'INVALID_PATH' | 'VALIDATION_ERROR' | 'CIRCULAR_REFERENCE'
  readonly message: string
  readonly path?: ObjectPath
  readonly cause?: unknown
}

/**
 * A plain object (not an array, not null, not a primitive).
 */
export type PlainObject = Record<string, unknown>

/**
 * Keys of T that have values of type V.
 */
export type KeysOfType<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never
}[keyof T]

/**
 * Get the type at a given path in an object.
 *
 * @typeParam T - The object type
 * @typeParam P - The path as a tuple of keys
 */
export type PathValue<T, P extends readonly any[]> = P extends readonly [infer First, ...infer Rest]
  ? First extends keyof T
    ? Rest extends readonly any[]
      ? PathValue<T[First], Rest>
      : T[First]
    : never
  : T
