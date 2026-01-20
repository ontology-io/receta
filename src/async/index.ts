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
export { mapAsync } from './mapAsync'
export { filterAsync } from './filterAsync'
export { parallel } from './parallel'
export { sequential } from './sequential'

// Error handling
export { retry, sleep } from './retry'
export { timeout, timeoutFn, TimeoutError } from './timeout'

// Polling and batching
export { poll } from './poll'
export { batch, chunk } from './batch'

// Rate limiting
export { debounce } from './debounce'
export { throttle } from './throttle'
