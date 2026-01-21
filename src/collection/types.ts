/**
 * Collection module types.
 *
 * @module collection/types
 */

/**
 * Result of a diff operation showing added, updated, and removed items.
 *
 * @typeParam T - The type of items in the collection
 *
 * @example
 * ```typescript
 * const result: DiffResult<User> = {
 *   added: [newUser],
 *   updated: [{ old: oldUser, new: updatedUser }],
 *   removed: [deletedUser],
 *   unchanged: [sameUser]
 * }
 * ```
 */
export interface DiffResult<T> {
  readonly added: readonly T[]
  readonly updated: readonly UpdatedItem<T>[]
  readonly removed: readonly T[]
  readonly unchanged: readonly T[]
}

/**
 * Represents an item that was updated in a diff operation.
 *
 * @typeParam T - The type of the item
 */
export interface UpdatedItem<T> {
  readonly old: T
  readonly new: T
}

/**
 * Configuration for pagination operations.
 *
 * @example
 * ```typescript
 * const config: PaginationConfig = {
 *   page: 1,
 *   pageSize: 20
 * }
 * ```
 */
export interface PaginationConfig {
  readonly page: number
  readonly pageSize: number
}

/**
 * Cursor-based pagination configuration.
 *
 * @example
 * ```typescript
 * const config: CursorPaginationConfig<string> = {
 *   cursor: 'user_123',
 *   limit: 20
 * }
 * ```
 */
export interface CursorPaginationConfig<TCursor> {
  readonly cursor?: TCursor
  readonly limit: number
}

/**
 * Result of a pagination operation.
 *
 * @typeParam T - The type of items in the page
 *
 * @example
 * ```typescript
 * const page: PaginatedResult<User> = {
 *   items: users,
 *   page: 1,
 *   pageSize: 20,
 *   total: 100,
 *   hasNext: true,
 *   hasPrevious: false
 * }
 * ```
 */
export interface PaginatedResult<T> {
  readonly items: readonly T[]
  readonly page: number
  readonly pageSize: number
  readonly total: number
  readonly hasNext: boolean
  readonly hasPrevious: boolean
}

/**
 * Result of a cursor-based pagination operation.
 *
 * @typeParam T - The type of items in the page
 * @typeParam TCursor - The type of the cursor
 *
 * @example
 * ```typescript
 * const page: CursorPaginatedResult<User, string> = {
 *   items: users,
 *   nextCursor: 'user_456',
 *   hasMore: true
 * }
 * ```
 */
export interface CursorPaginatedResult<T, TCursor> {
  readonly items: readonly T[]
  readonly nextCursor?: TCursor | undefined
  readonly hasMore: boolean
}

/**
 * Configuration for nested grouping operations.
 *
 * @typeParam T - The type of items being grouped
 *
 * @example
 * ```typescript
 * const config: NestConfig<Comment> = {
 *   by: ['userId', 'postId'],
 *   createEmpty: () => []
 * }
 * ```
 */
export interface NestConfig<T> {
  readonly by: readonly (keyof T | ((item: T) => string | number))[]
  readonly createEmpty?: () => unknown
}

/**
 * A nested map structure for hierarchical grouping.
 *
 * @example
 * ```typescript
 * const nested: NestedMap<Comment> = {
 *   'user_1': {
 *     'post_1': [comment1, comment2],
 *     'post_2': [comment3]
 *   }
 * }
 * ```
 */
export type NestedMap<T> = {
  [key: string | number]: T | NestedMap<T> | readonly T[]
}

/**
 * Configuration for index operations with collision handling.
 *
 * @typeParam T - The type of items being indexed
 *
 * @example
 * ```typescript
 * const config: IndexConfig<User> = {
 *   onCollision: 'error' // or 'first' | 'last'
 * }
 * ```
 */
export interface IndexConfig {
  readonly onCollision?: 'error' | 'first' | 'last'
}

/**
 * Error thrown when a duplicate key is found during indexing.
 */
export class DuplicateKeyError extends Error {
  constructor(
    public readonly key: string | number,
    message = `Duplicate key found: ${key}`
  ) {
    super(message)
    this.name = 'DuplicateKeyError'
  }
}

/**
 * Comparator function for custom equality checks.
 *
 * @typeParam T - The type of items being compared
 */
export type Comparator<T> = (a: T, b: T) => boolean
