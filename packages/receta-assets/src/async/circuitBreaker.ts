import { err, isOk, tryCatchAsync, type Result } from '@ontologyio/receta/result'

export type CircuitBreakerOptions = {
  /** How many calls in a row must fail before the circuit opens. */
  readonly failureThreshold: number
  /** How long the circuit stays open before one trial call is let through. */
  readonly cooldownMs: number
  /** The clock, such as `Date.now`. A test passes a fake one. */
  readonly now: () => number
}

export type CircuitBreakerError =
  | {
      /** The call wasn't made: the circuit is open, or a trial call is already running. */
      readonly code: 'CIRCUIT_OPEN'
      readonly retryInMs: number
      readonly message: string
    }
  | { readonly code: 'CALL_FAILED'; readonly error: unknown; readonly message: string }

type CircuitState =
  | { readonly kind: 'closed'; readonly failures: number }
  | { readonly kind: 'open'; readonly since: number }
  | { readonly kind: 'trial' }

/**
 * Wraps an async call so that after enough failures in a row it fails fast for a cooldown, instead of hitting a service that is down.
 *
 * Use when: a dependency such as a payment provider, a search cluster or an internal service
 * goes down, and every request waiting on its timeout would pile up and slow the whole app.
 * While the circuit is open, calls return `CIRCUIT_OPEN` at once, with how long until the
 * next try. After the cooldown, one trial call decides: success closes the circuit, failure
 * opens it again. Make one breaker per dependency and share it.
 *
 * ```text
 *  ┌────────┐  failureThreshold calls fail in a row ┌──────┐  calls get
 *  │ closed │──────────────────────────────────────▶│ open │  CIRCUIT_OPEN
 *  └────────┘                                       └──┬───┘
 *       ▲                                              │ cooldownMs passed
 *       │ trial call succeeds  ┌───────┐  next call    │
 *       └──────────────────────│ trial │◀──────────────┘
 *                              └───┬───┘
 *                                  │ trial call fails ──▶ open again
 * ```
 *
 * @example
 * ```ts
 * let time = 0
 * let healthy = false
 * const charge = async (amount: number) => (healthy ? `charged ${amount}` : Promise.reject('503'))
 * const guardedCharge = circuitBreaker(charge, { failureThreshold: 2, cooldownMs: 1000, now: () => time })
 *
 * await guardedCharge(5)
 * await guardedCharge(5)
 * await guardedCharge(5)
 * // => Err({ code: 'CIRCUIT_OPEN', retryInMs: 1000, message: 'The circuit is open; try again in 1000 ms' })
 *
 * time = 1000
 * healthy = true
 * await guardedCharge(5)
 * // => Ok('charged 5')
 * ```
 *
 * @tags circuit breaker, fail fast, resilience, outage, cooldown, dependency, bulkhead
 * @see retryTransientHttp - retries one call; a breaker stops calls across many requests
 * @see tryCatchAsync - @ontologyio/receta/result, turns each failed call into an Err
 */
export function circuitBreaker<A extends readonly unknown[], T>(
  call: (...args: A) => Promise<T>,
  options: CircuitBreakerOptions,
): (...args: A) => Promise<Result<T, CircuitBreakerError>> {
  let state: CircuitState = { kind: 'closed', failures: 0 }

  const afterFailure = (failed: CircuitState): CircuitState => {
    const failures = failed.kind === 'closed' ? failed.failures + 1 : options.failureThreshold
    return failures >= options.failureThreshold
      ? { kind: 'open', since: options.now() }
      : { kind: 'closed', failures }
  }

  const attempt = async (args: A, from: CircuitState): Promise<Result<T, CircuitBreakerError>> => {
    const outcome = await tryCatchAsync(
      () => call(...args),
      (error): CircuitBreakerError => ({ code: 'CALL_FAILED', error, message: 'The call failed' }),
    )
    state = isOk(outcome) ? { kind: 'closed', failures: 0 } : afterFailure(from.kind === 'trial' ? from : state)
    return outcome
  }

  const rejected = (retryInMs: number, message: string) => err<CircuitBreakerError>({ code: 'CIRCUIT_OPEN', retryInMs, message })

  return async (...args) => {
    if (state.kind === 'trial') return rejected(0, 'A trial call is running; try again when it finishes')
    if (state.kind === 'closed') return attempt(args, state)
    const retryInMs = state.since + options.cooldownMs - options.now()
    if (retryInMs > 0) return rejected(retryInMs, `The circuit is open; try again in ${retryInMs} ms`)
    state = { kind: 'trial' }
    return attempt(args, state)
  }
}
