/**
 * Represents a successful computation containing a value.
 */
export interface Ok<T> {
  readonly _tag: 'Ok'
  readonly value: T
}

/**
 * Represents a failed computation containing an error.
 */
export interface Err<E> {
  readonly _tag: 'Err'
  readonly error: E
}

/**
 * Result type representing either success (Ok) or failure (Err).
 *
 * @typeParam T - The type of the success value
 * @typeParam E - The type of the error value
 *
 * @example
 * ```typescript
 * type ParseResult = Result<number, string>
 *
 * const success: ParseResult = { _tag: 'Ok', value: 42 }
 * const failure: ParseResult = { _tag: 'Err', error: 'Invalid number' }
 * ```
 */
export type Result<T, E> = Ok<T> | Err<E>
