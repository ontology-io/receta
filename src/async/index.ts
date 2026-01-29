/**
 * Async module - Promise utilities, concurrency control, and async patterns
 *
 * All async error-handling functions return Result<T, E> for explicit, type-safe error handling.
 *
 * @module async
 */

// Types
export type {
  RetryOptions,
  ConcurrencyOptions,
  PollOptions,
  BatchOptions,
  DebounceOptions,
  ThrottleOptions,
} from './types'

// Concurrency control with Result pattern
export { mapAsync, mapAsyncOrThrow, type MapAsyncError } from './mapAsync'
export { filterAsync, filterAsyncOrThrow, type FilterAsyncError } from './filterAsync'
export { parallel, parallelOrThrow } from './parallel'
export { sequential, sequentialOrThrow, type SequentialError } from './sequential'

// Error handling with Result pattern
export { retry, sleep, type RetryError } from './retry'
export { timeout, TimeoutError } from './timeout'

// Polling and batching
export { poll, type PollError } from './poll'
export { batch, batchOrThrow, type BatchError } from './batch'

// Re-export Remeda's chunk utility (no need to reimplement)
export { chunk } from 'remeda'

// Rate limiting
export { debounce } from './debounce'
export { throttle } from './throttle'

// Async composition
export { pipeAsync } from './pipeAsync'

// Promise utilities
export {
  promiseAllSettled,
  extractFulfilled,
  extractRejected,
  toResults,
} from './promiseAllSettled'
