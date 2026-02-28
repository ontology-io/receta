/**
 * Options for retry operations.
 */
export interface RetryOptions {
  /**
   * Maximum number of retry attempts.
   * @default 3
   */
  readonly maxAttempts?: number

  /**
   * Initial delay in milliseconds before the first retry.
   * @default 1000
   */
  readonly delay?: number

  /**
   * Backoff multiplier for exponential backoff.
   * Set to 1 for constant delay.
   * @default 2
   */
  readonly backoff?: number

  /**
   * Maximum delay in milliseconds between retries.
   * @default 30000
   */
  readonly maxDelay?: number

  /**
   * Function to determine if an error should be retried.
   * Return true to retry, false to fail immediately.
   */
  readonly shouldRetry?: (error: unknown, attempt: number) => boolean

  /**
   * Callback invoked on each retry attempt.
   */
  readonly onRetry?: (error: unknown, attempt: number, delay: number) => void
}

/**
 * Options for concurrent operations.
 */
export interface ConcurrencyOptions {
  /**
   * Maximum number of concurrent operations.
   * Set to Infinity for unlimited concurrency.
   * @default Infinity
   */
  readonly concurrency?: number
}

/**
 * Options for polling operations.
 */
export interface PollOptions {
  /**
   * Interval between poll attempts in milliseconds.
   * @default 1000
   */
  readonly interval?: number

  /**
   * Maximum number of poll attempts.
   * @default 10
   */
  readonly maxAttempts?: number

  /**
   * Timeout in milliseconds for the entire polling operation.
   */
  readonly timeout?: number

  /**
   * Predicate to determine if polling should stop.
   * Return true to continue polling, false to stop.
   */
  readonly shouldContinue?: (attempt: number) => boolean

  /**
   * Callback invoked on each poll attempt.
   */
  readonly onPoll?: (attempt: number) => void
}

/**
 * Options for batch operations.
 */
export interface BatchOptions {
  /**
   * Number of items to process per batch.
   * @default 10
   */
  readonly batchSize?: number

  /**
   * Delay in milliseconds between batches.
   * @default 0
   */
  readonly delayBetweenBatches?: number

  /**
   * Maximum number of concurrent batches.
   * @default 1
   */
  readonly concurrency?: number
}

/**
 * Options for debounce operations.
 */
export interface DebounceOptions {
  /**
   * Delay in milliseconds to wait before invoking the function.
   */
  readonly delay: number

  /**
   * Whether to invoke the function on the leading edge.
   * @default false
   */
  readonly leading?: boolean

  /**
   * Whether to invoke the function on the trailing edge.
   * @default true
   */
  readonly trailing?: boolean
}

/**
 * Options for throttle operations.
 */
export interface ThrottleOptions {
  /**
   * Delay in milliseconds between function invocations.
   */
  readonly delay: number

  /**
   * Whether to invoke the function on the leading edge.
   * @default true
   */
  readonly leading?: boolean

  /**
   * Whether to invoke the function on the trailing edge.
   * @default true
   */
  readonly trailing?: boolean
}
