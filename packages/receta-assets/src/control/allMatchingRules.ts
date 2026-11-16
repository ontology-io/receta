import * as R from 'remeda'
import { juxt } from '@ontologyio/receta/function'

export type AllMatchingRulesEntry<T, U> = {
  readonly name: string
  readonly when: (value: T) => boolean
  readonly outcome: U
}

export type AllMatchingRulesHit<U> = {
  readonly rule: string
  readonly outcome: U
}

/**
 * Checks every named rule against one value and returns all that match, in rule order.
 *
 * Use when: several outcomes can apply at once, such as badges on a profile, warnings on a
 * checkout, labels on a support ticket or flags on a transaction, and each needs its rule's
 * name for display or audit. Every rule runs, so rules must not depend on each other. No match
 * gives an empty list.
 *
 * @example
 * ```ts
 * import { gte, neq, where } from '@ontologyio/receta/predicate'
 *
 * type Txn = { amount: number; country: string; newDevice: boolean }
 * const flags = [
 *   { name: 'large', when: where<Txn>({ amount: gte(5000) }), outcome: 'review' },
 *   { name: 'abroad', when: where<Txn>({ country: neq('DE') }), outcome: 'notify' },
 *   { name: 'device', when: where<Txn>({ newDevice: Boolean }), outcome: 'step-up' },
 * ]
 *
 * allMatchingRules({ amount: 9000, country: 'FR', newDevice: false }, flags)
 * // => [{ rule: 'large', outcome: 'review' }, { rule: 'abroad', outcome: 'notify' }]
 *
 * R.pipe({ amount: 20, country: 'DE', newDevice: false }, allMatchingRules(flags))
 * // => []
 * ```
 *
 * @tags rules, rule engine, all matches, flags, badges, labels, warnings, fraud
 * @see firstMatchingRule - only the first rule that matches
 * @see juxt - @ontologyio/receta/function, runs every rule against the one value
 */
export function allMatchingRules<T, U>(
  value: T,
  rules: readonly AllMatchingRulesEntry<T, U>[],
): readonly AllMatchingRulesHit<U>[]
export function allMatchingRules<T, U>(
  rules: readonly AllMatchingRulesEntry<T, U>[],
): (value: T) => readonly AllMatchingRulesHit<U>[]
export function allMatchingRules(...args: unknown[]): unknown {
  return R.purry(allMatchingRulesImplementation, args)
}

const allMatchingRulesImplementation = <T, U>(
  value: T,
  rules: readonly AllMatchingRulesEntry<T, U>[],
): readonly AllMatchingRulesHit<U>[] => {
  const verdicts = juxt(R.map(rules, (rule) => rule.when), value)
  return R.pipe(
    R.zip(rules, verdicts),
    R.filter(([, matched]) => matched),
    R.map(([rule]) => ({ rule: rule.name, outcome: rule.outcome })),
  )
}
