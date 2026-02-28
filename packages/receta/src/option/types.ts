/**
 * Represents a value that exists.
 */
export interface Some<T> {
  readonly _tag: 'Some'
  readonly value: T
}

/**
 * Represents the absence of a value.
 */
export interface None {
  readonly _tag: 'None'
}

/**
 * Option type representing either a value (Some) or no value (None).
 *
 * @typeParam T - The type of the value when present
 *
 * @example
 * ```typescript
 * type MaybeUser = Option<User>
 *
 * const present: MaybeUser = { _tag: 'Some', value: { name: 'John' } }
 * const absent: MaybeUser = { _tag: 'None' }
 * ```
 */
export type Option<T> = Some<T> | None
