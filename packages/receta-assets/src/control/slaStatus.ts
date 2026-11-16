import * as R from 'remeda'
import { switchCase } from '@ontologyio/receta/function'
import { gte } from '@ontologyio/receta/predicate'

export type SlaStatusPolicy = {
  /** The current time in epoch milliseconds, such as `Date.now()`. */
  readonly now: number
  /** How long after opening the item is at risk. */
  readonly warnAfterMs: number
  /** How long after opening the target is missed. */
  readonly breachAfterMs: number
}

export type SlaStatusResult = {
  readonly status: 'on_track' | 'at_risk' | 'breached'
  /** Time left before the breach; negative once breached, by how much it is overdue. */
  readonly remainingMs: number
}

/**
 * Says whether an item opened at a given time is on track, at risk or past its deadline, and how much time is left.
 *
 * Use when: a support ticket, an incident, an approval or an order has a response or resolution
 * target, and a queue, a badge or an alert needs its state. Takes the open time in epoch
 * milliseconds and `now` from the caller, so the result is testable. An open time in the future,
 * from clock skew, counts as on track.
 *
 * @example
 * ```ts
 * const hour = 3_600_000
 * const policy = { now: 10 * hour, warnAfterMs: 3 * hour, breachAfterMs: 4 * hour }
 *
 * slaStatus(9 * hour, policy)
 * // => { status: 'on_track', remainingMs: 3 * hour }
 *
 * slaStatus(6.5 * hour, policy)
 * // => { status: 'at_risk', remainingMs: 0.5 * hour }
 *
 * R.map([5 * hour, 10 * hour], slaStatus(policy))
 * // => [{ status: 'breached', remainingMs: -1 * hour }, { status: 'on_track', remainingMs: 4 * hour }]
 * ```
 *
 * @tags sla, deadline, overdue, ticket, support, incident, due, at risk, escalation, age
 * @see switchCase - @ontologyio/receta/function, picks the status from the elapsed time
 * @see bandOf - any number of thresholds, with labels you choose
 */
export function slaStatus(openedAt: number, policy: SlaStatusPolicy): SlaStatusResult
export function slaStatus(policy: SlaStatusPolicy): (openedAt: number) => SlaStatusResult
export function slaStatus(...args: unknown[]): unknown {
  return R.purry(slaStatusImplementation, args)
}

const slaStatusImplementation = (openedAt: number, policy: SlaStatusPolicy): SlaStatusResult => {
  const elapsed = policy.now - openedAt
  const status = switchCase<number, SlaStatusResult['status']>(
    [
      [gte(policy.breachAfterMs), R.constant('breached')],
      [gte(policy.warnAfterMs), R.constant('at_risk')],
    ],
    'on_track',
    elapsed,
  )
  return { status, remainingMs: policy.breachAfterMs - elapsed }
}
