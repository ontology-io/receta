import * as R from 'remeda'
import { when } from '@ontologyio/receta/function'
import { eq } from '@ontologyio/receta/predicate'

export type ApplyEnabledStepsStep<T> = readonly [flag: string, transform: (value: T) => T]

/**
 * Runs a list of flagged steps in order, applying each one only when its feature flag is on.
 *
 * Use when: a payload, a price or a page model passes through several optional stages, each
 * behind its own flag, such as tax rules, a new ranking and a promo banner that roll out
 * independently. Steps run in list order and each sees the previous step's output. Only the
 * value `true` turns a flag on; a missing flag, `'true'` or `1` leave the step out.
 *
 * @example
 * ```ts
 * const steps = [
 *   ['vatInclusive', (cents: number) => Math.round(cents * 1.2)],
 *   ['roundPrices', (cents: number) => Math.ceil(cents / 100) * 100 - 1],
 *   ['blackFriday', (cents: number) => Math.round(cents * 0.5)],
 * ] as const
 *
 * applyEnabledSteps(1250, { vatInclusive: true, roundPrices: true }, steps)
 * // => 1499
 *
 * applyEnabledSteps(1250, { roundPrices: true, blackFriday: 'yes' }, steps)
 * // => 1299
 *
 * R.pipe(1250, applyEnabledSteps({}, steps))
 * // => 1250
 * ```
 *
 * @tags feature flag, pipeline, steps, toggle, rollout, conditional, config, stages
 * @see applyIfEnabled - one flagged step
 * @see when - @ontologyio/receta/function, each step's condition
 */
export function applyEnabledSteps<T>(
  value: T,
  flags: Readonly<Record<string, unknown>>,
  steps: readonly ApplyEnabledStepsStep<T>[],
): T
export function applyEnabledSteps<T>(
  flags: Readonly<Record<string, unknown>>,
  steps: readonly ApplyEnabledStepsStep<T>[],
): (value: T) => T
export function applyEnabledSteps(...args: unknown[]): unknown {
  return R.purry(applyEnabledStepsImplementation, args)
}

const applyEnabledStepsImplementation = <T>(
  value: T,
  flags: Readonly<Record<string, unknown>>,
  steps: readonly ApplyEnabledStepsStep<T>[],
): T =>
  R.reduce(
    steps,
    (current, [flag, transform]) => when(R.constant(eq<unknown>(true)(flags[flag])), transform, current),
    value,
  )
