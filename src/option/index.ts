/**
 * Option module - Handling optional values with Option<T> type
 *
 * @module option
 */

// Types
export type { Option, Some, None } from './types'

// Constructors
export { some, none, fromNullable, fromResult, tryCatch } from './constructors'

// Type guards
export { isSome, isNone } from './guards'

// Transformers
export { map } from './map'
export { flatMap } from './flatMap'
export { filter } from './filter'
export { flatten } from './flatten'

// Extractors
export { unwrap, unwrapOr, unwrapOrElse } from './unwrap'
export { match } from './match'

// Side effects
export { tap, tapNone } from './tap'

// Combinators
export { collect } from './collect'
export { partition } from './partition'

// Conversions
export { toResult } from './toResult'
export { toNullable } from './toNullable'
