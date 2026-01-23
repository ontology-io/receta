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

// Concurrency control
export { mapAsync } from './mapAsync'
export { filterAsync } from './filterAsync'
export { parallel } from './parallel'
export { sequential } from './sequential'

// Error handling with Result pattern
export { retry, sleep, type RetryError } from './retry'
export { timeout, TimeoutError } from './timeout'

// Polling and batching
export { poll, type PollError } from './poll'
export { batch } from './batch'

// Re-export Remeda's chunk utility (no need to reimplement)
export { chunk } from 'remeda'

// Rate limiting
export { debounce } from './debounce'
export { throttle } from './throttle'
