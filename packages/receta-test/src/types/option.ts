/**
 * Option type definitions (copied from receta for type-only imports).
 */

export interface Some<T> {
  readonly _tag: 'Some'
  readonly value: T
}

export interface None {
  readonly _tag: 'None'
}

export type Option<T> = Some<T> | None
