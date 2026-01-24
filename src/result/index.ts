/**
 * Result module - Error handling with Result<T, E> type
 *
 * @module result
 */

// Types
export type { Result, Ok, Err } from './types'

// Constructors
export { ok, err, tryCatch, tryCatchAsync } from './constructors'

// Type guards
export { isOk, isErr } from './guards'

// Transformers
export { map } from './map'
export { mapErr } from './mapErr'
export { flatMap } from './flatMap'
export { flatten } from './flatten'

// Extractors
export { unwrap, unwrapOr, unwrapOrElse } from './unwrap'

// Pattern matching
export { match } from './match'

// Side effects
export { tap, tapErr } from './tap'

// Combinators
export { collect } from './collect'
export { partition } from './partition'

// Conversions
export { fromNullable } from './fromNullable'

// Utilities
export { orThrow } from './orThrow'
