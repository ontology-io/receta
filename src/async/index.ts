/**
 * Async module - Promise utilities, concurrency control, and async patterns
 *
 * @module async
 */

// Types
export type {
  RetryOptions,
  ConcurrencyOptions,
  TimeoutOptions,
  PollOptions,
  BatchOptions,
  DebounceOptions,
  ThrottleOptions,
} from './types'

// Concurrency control
export { mapAsync, mapAsyncResult, type MapAsyncError } from './mapAsync'
export { filterAsync } from './filterAsync'
export { parallel } from './parallel'
export { sequential } from './sequential'

// Error handling
export { retry, retryResult, sleep, type RetryError } from './retry'
export { timeout, timeoutResult, timeoutFn, TimeoutError } from './timeout'

// Polling and batching
export { poll, pollResult, type PollError } from './poll'
export { batch, chunk } from './batch'

// Rate limiting
export { debounce } from './debounce'
export { throttle } from './throttle'
