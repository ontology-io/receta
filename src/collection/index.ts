/**
 * Collection module - Advanced collection operations for real-world applications.
 *
 * Provides higher-level patterns for working with collections including:
 * - Hierarchical grouping (nest)
 * - Change detection (diff)
 * - Pagination (offset and cursor-based)
 * - Safe indexing with collision handling
 * - Set operations with custom comparators
 *
 * @module collection
 */

// Types
export type {
  DiffResult,
  UpdatedItem,
  PaginationConfig,
  CursorPaginationConfig,
  PaginatedResult,
  CursorPaginatedResult,
  NestConfig,
  NestedMap,
  IndexConfig,
  Comparator,
  FlattenConfig,
  FlattenedItem,
  WindowSlidingConfig,
} from './types'

export { DuplicateKeyError } from './types'

// Hierarchical grouping
export { nest } from './nest'
export { groupByPath } from './groupByPath'

// Change detection
export { diff } from './diff'

// Pagination
export { paginate, paginateCursor } from './paginate'

// Indexing
export { indexByUnique } from './indexByUnique'

// Set operations
export { union, intersect, symmetricDiff } from './setOps'

// Tree operations
export { flatten } from './flatten'

// Sequence operations
export { batchBy } from './batchBy'
export { windowSliding } from './windowSliding'
export { cartesianProduct } from './cartesianProduct'

// Array manipulation
export { moveIndex } from './moveIndex'
export { insertAt } from './insertAt'
export { updateAt } from './updateAt'
export { removeAtIndex } from './removeAtIndex'
