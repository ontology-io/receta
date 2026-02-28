/**
 * A Lens is a composable getter/setter pair for immutable updates.
 *
 * A lens focuses on a specific part of a data structure, allowing you to
 * read and update that part without mutating the original structure.
 *
 * @typeParam S - The source type (the whole data structure)
 * @typeParam A - The focus type (the part being accessed)
 *
 * @example
 * ```typescript
 * // Lens focusing on a user's name
 * const nameLens: Lens<User, string> = {
 *   get: (user) => user.name,
 *   set: (name) => (user) => ({ ...user, name })
 * }
 * ```
 */
export interface Lens<S, A> {
  /**
   * Gets the focused value from the source.
   */
  readonly get: (source: S) => A

  /**
   * Sets the focused value in the source, returning a new source.
   */
  readonly set: (value: A) => (source: S) => S
}

/**
 * A path type that can be used to access nested properties.
 *
 * Supports dot notation for nested object access.
 *
 * @example
 * ```typescript
 * type UserPath = Path<User>
 * // Can be: 'name' | 'email' | 'address.street' | 'address.city'
 * ```
 */
export type Path<T> = string

/**
 * Type helper to extract the type at a given path.
 *
 * @internal
 */
export type PathValue<T, P extends string> = P extends keyof T
  ? T[P]
  : P extends `${infer K}.${infer Rest}`
    ? K extends keyof T
      ? PathValue<T[K], Rest>
      : never
    : never
