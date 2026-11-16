import * as R from 'remeda'
import { when } from '@ontologyio/receta/function'
import { eq } from '@ontologyio/receta/predicate'

/**
 * Applies a transform only when a feature flag is on, and returns the value untouched otherwise.
 *
 * Use when: a step in a pipeline sits behind a feature flag, such as a new price calculation,
 * a redesigned payload or an experimental ranking, and flags come from remote config or the
 * environment. Only the value `true` turns a flag on: a missing flag, `false`, `'true'`, `1` or
 * a prototype key such as `constructor` all leave it off, so a typo in config fails closed.
 *
 * @example
 * ```ts
 * const flags = { newPricing: true, betaRanking: 'true' }
 * const withDiscount = (cart: { total: number }) => ({ total: cart.total * 0.9 })
 *
 * applyIfEnabled({ total: 100 }, flags, 'newPricing', withDiscount)
 * // => { total: 90 }
 *
 * applyIfEnabled({ total: 100 }, flags, 'betaRanking', withDiscount)
 * // => { total: 100 }
 *
 * R.pipe({ total: 100 }, applyIfEnabled(flags, 'missingFlag', withDiscount))
 * // => { total: 100 }
 * ```
 *
 * @tags feature flag, toggle, rollout, config, conditional, when, experiment, kill switch
 * @see when - @ontologyio/receta/function, the conditional transform underneath
 * @see applyEnabledSteps - several flagged steps in order
 * @see inRollout - turns a flag on for a percentage of users
 */
export function applyIfEnabled<T>(
  value: T,
  flags: Readonly<Record<string, unknown>>,
  flag: string,
  transform: (value: T) => T,
): T
export function applyIfEnabled<T>(
  flags: Readonly<Record<string, unknown>>,
  flag: string,
  transform: (value: T) => T,
): (value: T) => T
export function applyIfEnabled(...args: unknown[]): unknown {
  return R.purry(applyIfEnabledImplementation, args)
}

const applyIfEnabledImplementation = <T>(
  value: T,
  flags: Readonly<Record<string, unknown>>,
  flag: string,
  transform: (value: T) => T,
): T => when(R.constant(eq<unknown>(true)(flags[flag])), transform, value)
