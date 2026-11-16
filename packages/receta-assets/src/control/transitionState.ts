import * as R from 'remeda'
import { flatMap, fromNullable, map, toResult, unwrapOr, type Option } from '@ontologyio/receta/option'
import { by, eq } from '@ontologyio/receta/predicate'
import type { Result } from '@ontologyio/receta/result'

/** For each state, the events it accepts and the state each one leads to. */
export type TransitionStateTable<S extends string> = {
  readonly [K in S]?: Readonly<Record<string, S>>
}

export type TransitionStateError<S extends string> = {
  readonly code: 'INVALID_TRANSITION'
  readonly input: { readonly state: S; readonly event: string }
  /** The events the current state does accept, empty for a final state. */
  readonly allowed: readonly string[]
  readonly message: string
}

/** A record's own value for a key, so `constructor` or `toString` never come from the prototype. */
const own = <V>(record: Readonly<Record<string, V>>, key: string): Option<V> =>
  R.pipe(
    R.find(R.entries(record), by(([name]) => name, eq(key))),
    fromNullable,
    map(([, value]) => value),
  )

/**
 * Moves a state machine one step: the next state for an event, or an error naming what is allowed.
 *
 * Use when: a record has a lifecycle, such as an order, a ticket, a subscription or a document
 * review, and a request asks to apply an event to it. The table lists each state's accepted
 * events; anything missing is refused, so a shipped order can't be paid twice. A state with no
 * entry is final. The event is a plain string, so it can come straight from a request body.
 *
 * @example
 * ```ts
 * type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
 *
 * const orderFlow: { [K in OrderStatus]?: Record<string, OrderStatus> } = {
 *   pending: { pay: 'paid', cancel: 'cancelled' },
 *   paid: { ship: 'shipped', cancel: 'cancelled' },
 *   shipped: { deliver: 'delivered' },
 * }
 *
 * transitionState('pending', 'pay', orderFlow)
 * // => Ok('paid')
 *
 * transitionState('shipped', 'cancel', orderFlow)
 * // => Err({ code: 'INVALID_TRANSITION', input: { state: 'shipped', event: 'cancel' }, allowed: ['deliver'], message: 'Can\'t "cancel" from "shipped". Allowed: deliver' })
 *
 * const current: OrderStatus = 'delivered'
 * R.pipe(current, transitionState('cancel', orderFlow))
 * // => Err({ code: 'INVALID_TRANSITION', input: { state: 'delivered', event: 'cancel' }, allowed: [], message: 'Can\'t "cancel" from "delivered". Allowed: none' })
 * ```
 *
 * @tags state machine, transition, workflow, lifecycle, status, fsm, order, event
 * @see toResult - @ontologyio/receta/option, turns a missing transition into the error
 * @see routeEvent - runs a handler per event type, without states
 */
export function transitionState<S extends string>(
  state: NoInfer<S>,
  event: string,
  table: TransitionStateTable<S>,
): Result<S, TransitionStateError<S>>
export function transitionState<S extends string>(
  event: string,
  table: TransitionStateTable<S>,
): (state: S) => Result<S, TransitionStateError<S>>
export function transitionState(...args: unknown[]): unknown {
  return R.purry(transitionStateImplementation, args)
}

const transitionStateImplementation = <S extends string>(
  state: S,
  event: string,
  table: TransitionStateTable<S>,
): Result<S, TransitionStateError<S>> => {
  const rows = table as Readonly<Record<string, Readonly<Record<string, S>> | undefined>>
  const transitions = R.pipe(own(rows, state), flatMap(fromNullable))
  const allowed = R.pipe(
    transitions,
    map((events) => R.keys(events)),
    unwrapOr<readonly string[]>([]),
  )
  const refused: TransitionStateError<S> = {
    code: 'INVALID_TRANSITION',
    input: { state, event },
    allowed,
    message: `Can't "${event}" from "${state}". Allowed: ${R.isEmpty(allowed) ? 'none' : R.join(allowed, ', ')}`,
  }
  return R.pipe(
    transitions,
    flatMap((events) => own(events, event)),
    toResult(refused),
  )
}
