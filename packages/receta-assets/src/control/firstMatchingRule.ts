import * as R from 'remeda'
import { fromNullable, map, type Option } from '@ontologyio/receta/option'

export type FirstMatchingRuleEntry<T, U> = {
  /** Shows up in the result, so a log or an audit trail can say why. */
  readonly name: string
  readonly when: (value: T) => boolean
  readonly outcome: U
}

export type FirstMatchingRuleHit<U> = {
  readonly rule: string
  readonly outcome: U
}

/**
 * Checks named rules in order and returns the first one that matches, with its outcome and name.
 *
 * Use when: a decision such as a discount, a routing queue or a risk flag comes from an ordered
 * list of rules, and you need to record which rule decided. Order matters: put the specific
 * rules before the broad ones. `None` when no rule matches, so add a last rule with
 * `when: () => true` if there must always be an outcome.
 *
 * @example
 * ```ts
 * import { gte, where } from '@ontologyio/receta/predicate'
 *
 * type Order = { total: number; firstOrder: boolean }
 * const discounts = [
 *   { name: 'welcome', when: where<Order>({ firstOrder: Boolean }), outcome: 0.15 },
 *   { name: 'big-basket', when: where<Order>({ total: gte(200) }), outcome: 0.1 },
 * ]
 *
 * firstMatchingRule({ total: 250, firstOrder: true }, discounts)
 * // => Some({ rule: 'welcome', outcome: 0.15 })
 *
 * R.pipe({ total: 250, firstOrder: false }, firstMatchingRule(discounts))
 * // => Some({ rule: 'big-basket', outcome: 0.1 })
 *
 * firstMatchingRule({ total: 40, firstOrder: false }, discounts)
 * // => None
 * ```
 *
 * @tags rules, rule engine, first match, policy, decision, audit, cond, discount
 * @see allMatchingRules - every rule that matches, not only the first
 * @see decisionTable - rules written as field conditions, with a required default
 */
export function firstMatchingRule<T, U>(
  value: T,
  rules: readonly FirstMatchingRuleEntry<T, U>[],
): Option<FirstMatchingRuleHit<U>>
export function firstMatchingRule<T, U>(
  rules: readonly FirstMatchingRuleEntry<T, U>[],
): (value: T) => Option<FirstMatchingRuleHit<U>>
export function firstMatchingRule(...args: unknown[]): unknown {
  return R.purry(firstMatchingRuleImplementation, args)
}

const firstMatchingRuleImplementation = <T, U>(
  value: T,
  rules: readonly FirstMatchingRuleEntry<T, U>[],
): Option<FirstMatchingRuleHit<U>> =>
  R.pipe(
    R.find(rules, (rule) => rule.when(value)),
    fromNullable,
    map((rule) => ({ rule: rule.name, outcome: rule.outcome })),
  )
