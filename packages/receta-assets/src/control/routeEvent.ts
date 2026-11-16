import * as R from 'remeda'
import { flatMap, fromNullable, map, type Option } from '@ontologyio/receta/option'
import { by, eq } from '@ontologyio/receta/predicate'

export type RouteEventHandlers<E extends { readonly type: string }, U> = {
  readonly [K in E['type']]?: (event: Extract<E, { readonly type: K }>) => U
}

/** What the handlers in a table return, so `routeEvent` needs no type arguments data first. */
export type RouteEventOutput<H> = {
  [K in keyof H]-?: H[K] extends (event: never) => infer U ? U : never
}[keyof H]

/**
 * Sends an event to the handler registered for its `type`, or returns `None` when nothing handles it.
 *
 * Use when: processing webhooks (Stripe, GitHub, Slack), queue messages or UI actions where
 * you handle some event types and must acknowledge the rest without failing. Each handler
 * receives the event narrowed to its type. Only the table's own keys count, so an event typed
 * `constructor` from an untrusted sender is unhandled. Reach for `dispatchCommand` instead when
 * an unknown name is a mistake the caller should hear about.
 *
 * @example
 * ```ts
 * import { unwrapOr } from '@ontologyio/receta/option'
 *
 * type Event =
 *   | { type: 'invoice.paid'; amount: number }
 *   | { type: 'customer.deleted'; id: string }
 *   | { type: 'charge.refunded'; amount: number }
 *
 * const handlers = {
 *   'invoice.paid': (event: { amount: number }) => `credit ${event.amount}`,
 *   'customer.deleted': (event: { id: string }) => `archive ${event.id}`,
 * }
 *
 * const inbox: readonly Event[] = [
 *   { type: 'invoice.paid', amount: 4200 },
 *   { type: 'charge.refunded', amount: 500 },
 * ]
 *
 * R.map(inbox, (event) => routeEvent(event, handlers))
 * // => [Some('credit 4200'), None]
 *
 * R.map(inbox, (event) => R.pipe(routeEvent(event, handlers), unwrapOr('ignored')))
 * // => ['credit 4200', 'ignored']
 *
 * // Data last, name the event type: the handlers alone can't tell the whole union.
 * R.map(inbox, routeEvent<Event, string>(handlers))
 * // => [Some('credit 4200'), None]
 * ```
 *
 * @tags event, webhook, dispatch, router, handler, discriminated union, message, type
 * @see dispatchCommand - the same lookup by name, with an error when nothing handles it
 * @see fromNullable - @ontologyio/receta/option, turns a missing handler into `None`
 */
export function routeEvent<
  E extends { readonly type: string },
  H extends RouteEventHandlers<E, unknown>,
>(event: E, handlers: H): Option<RouteEventOutput<H>>
export function routeEvent<E extends { readonly type: string }, U>(
  handlers: RouteEventHandlers<E, U>,
): (event: E) => Option<U>
export function routeEvent(...args: unknown[]): unknown {
  return R.purry(routeEventImplementation, args)
}

const routeEventImplementation = <E extends { readonly type: string }, U>(
  event: E,
  handlers: RouteEventHandlers<E, U>,
): Option<U> => {
  // TypeScript can't tie a handler to its event type through a lookup, so widen them to E.
  const table = handlers as Readonly<Record<string, ((event: E) => U) | undefined>>
  return R.pipe(
    R.find(R.entries(table), by(([type]) => type, eq(event.type))),
    fromNullable,
    flatMap(([, handler]) => fromNullable(handler)),
    map((handler) => handler(event)),
  )
}
