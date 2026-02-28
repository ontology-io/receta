// Types
export type {
  Cache,
  KeyFn,
  MemoizeOptions,
  MemoizedFunction,
  MemoizedAsyncFunction,
} from './types'

// Core functions
export { memoize } from './memoize'
export { memoizeBy } from './memoizeBy'
export { memoizeAsync } from './memoizeAsync'

// Cache strategies
export { ttlCache, lruCache, weakCache } from './caches'

// Utilities
export { clearCache } from './clearCache'
export { invalidateMany, invalidateWhere, invalidateAll } from './invalidation'
