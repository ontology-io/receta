/**
 * Result type definitions (copied from receta for type-only imports).
 */

export interface Ok<T> {
  readonly _tag: 'Ok'
  readonly value: T
}

export interface Err<E> {
  readonly _tag: 'Err'
  readonly error: E
}

export type Result<T, E> = Ok<T> | Err<E>
