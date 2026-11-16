import { retry, timeout, type RetryError } from '@ontologyio/receta/async'
import { orThrow, type Result } from '@ontologyio/receta/result'

export type RetryWithTimeoutOptions = {
  /** How many attempts in all, the first one included. */
  readonly attempts: number
  /** How long one attempt may run before it counts as failed. */
  readonly timeoutMs: number
  /** Wait before the second attempt, doubled before each one after it. Defaults to 200. */
  readonly delayMs?: number
}

/**
 * Runs an async task with a time limit on each attempt, and retries attempts that fail or hang.
 *
 * Use when: calling a flaky dependency such as an HTTP API, a queue or a database, where one
 * hung call must not hold the caller and a fresh attempt often succeeds. The task is called
 * again for each attempt, so pass a function, not a promise.
 *
 * ```text
 *  task ──▶ ┌───────────────────┐  resolves in time  ╭───────────╮
 *           │ attempt n         │───────────────────▶│ Ok(value) │
 *           │ raced vs timeoutMs│                    ╰───────────╯
 *           └─────────┬─────────┘
 *                     │ rejects, or runs past timeoutMs
 *                     ▼
 *             ⟨ n < attempts ⟩───no───▶ ╭──────────────────────────────╮
 *                     │ yes             │ Err({ attempts, lastError }) │
 *                     ▼                 ╰──────────────────────────────╯
 *           wait delayMs × 2ⁿ⁻¹ ──▶ attempt n + 1
 * ```
 *
 * @example
 * ```ts
 * import * as R from 'remeda'
 * import { mapErr } from '@ontologyio/receta/result'
 *
 * let calls = 0
 * const busyTwice = async () => {
 *   calls += 1
 *   if (calls < 3) throw new Error('busy')
 *   return 'done'
 * }
 * await retryWithTimeout(busyTwice, { attempts: 3, timeoutMs: 50, delayMs: 1 })
 * // => Ok('done')
 *
 * const hangs = () => new Promise<string>(R.doNothing())
 * const gaveUp = await retryWithTimeout(hangs, { attempts: 2, timeoutMs: 10, delayMs: 1 })
 * R.pipe(gaveUp, mapErr((error) => error.attempts))
 * // => Err(2)
 * ```
 *
 * @tags retry, timeout, resilience, flaky, http, backoff, network
 * @see retry - @ontologyio/receta/async, retries without a time limit per attempt
 * @see timeout - @ontologyio/receta/async, one time limit without retries
 */
export async function retryWithTimeout<T>(
  task: () => Promise<T>,
  options: RetryWithTimeoutOptions,
): Promise<Result<T, RetryError>> {
  // retry asks for another attempt when the attempt throws, so a timed-out Err becomes a throw.
  const attempt = orThrow(() => timeout(task(), options.timeoutMs))
  return retry(attempt, { maxAttempts: options.attempts, delay: options.delayMs ?? 200 })
}
