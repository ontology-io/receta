import * as R from 'remeda'
import { fromNullable, map, type Option } from '@ontologyio/receta/option'
import { by, gt } from '@ontologyio/receta/predicate'

export type AssignVariantArm<V extends string> = {
  readonly name: V
  /** A share relative to the other arms; `{ a: 1, b: 1 }` is 50/50. Negative counts as 0. */
  readonly weight: number
}

export type AssignVariantExperiment<V extends string> = {
  /** Salts the hash, so each experiment splits users its own way. */
  readonly key: string
  readonly arms: readonly AssignVariantArm<V>[]
}

/**
 * FNV-1a over the characters, then MurmurHash3's finalizer: ids that differ only in their last
 * character, like `user-1` and `user-2`, would otherwise land close together.
 */
const hash32 = (text: string): number => {
  const fnv = R.reduce([...text], (hash, char) => Math.imul(hash ^ (char.codePointAt(0) ?? 0), 16777619), 2166136261)
  const mixed = Math.imul(fnv ^ (fnv >>> 16), 0x85ebca6b)
  const remixed = Math.imul(mixed ^ (mixed >>> 13), 0xc2b2ae35)
  return (remixed ^ (remixed >>> 16)) >>> 0
}

/**
 * Assigns a user to one arm of an A/B test by weight, always the same arm for the same user and experiment.
 *
 * Use when: splitting users between a control and one or more variants, on the server or the
 * client, without storing assignments. The user id and the experiment key are hashed to a point
 * along the arms' combined weight, and the arm covering that point wins. Keep the arms and their
 * order fixed while the test runs: changing a weight moves some users to another arm. `None`
 * when there are no arms or every weight is 0.
 *
 * ```text
 *  arms     control 50        new-copy 30   new-layout 20
 *           ├─────────────────┼─────────────┼──────────┤
 *           0                 50            80         100
 *                                  ▲
 *  hash(key:userId) → point 63 ────┘  lands in new-copy: Some('new-copy')
 * ```
 *
 * @example
 * ```ts
 * import { unwrapOr } from '@ontologyio/receta/option'
 *
 * const pricingTest = {
 *   key: 'pricing-page-2026',
 *   arms: [
 *     { name: 'control', weight: 50 },
 *     { name: 'new-copy', weight: 30 },
 *     { name: 'new-layout', weight: 20 },
 *   ],
 * }
 *
 * assignVariant('user-1', pricingTest)
 * // => Some('new-copy')
 *
 * assignVariant('user-1', { key: 'empty', arms: [] })
 * // => None
 *
 * const users = R.map(R.range(0, 1000), (n) => `user-${n}`)
 * R.pipe(users, R.map(assignVariant(pricingTest)), R.map(unwrapOr<string>('none')), R.countBy(R.identity()))
 * // => { control: 523, 'new-copy': 290, 'new-layout': 187 }
 * ```
 *
 * @tags ab test, experiment, variant, split test, bucketing, feature flag, weights, hash
 * @see inRollout - one on/off decision for a percentage of users
 * @see fromNullable - @ontologyio/receta/option, no arm covering the point becomes `None`
 */
export function assignVariant<V extends string>(
  subjectId: string,
  experiment: AssignVariantExperiment<V>,
): Option<V>
export function assignVariant<V extends string>(
  experiment: AssignVariantExperiment<V>,
): (subjectId: string) => Option<V>
export function assignVariant(...args: unknown[]): unknown {
  return R.purry(assignVariantImplementation, args)
}

const assignVariantImplementation = <V extends string>(
  subjectId: string,
  experiment: AssignVariantExperiment<V>,
): Option<V> => {
  const weights = R.map(experiment.arms, (arm) => Math.max(arm.weight, 0))
  const upperBounds = R.mapWithFeedback(weights, (total, weight) => total + weight, 0)
  const total = R.last(upperBounds) ?? 0
  // A point in [0, total): the hash as a fraction of 2³², scaled to the combined weight.
  const point = (hash32(`${experiment.key}:${subjectId}`) / 2 ** 32) * total
  return R.pipe(
    R.zip(experiment.arms, upperBounds),
    R.find(by(([, upTo]) => upTo, gt(point))),
    fromNullable,
    map(([arm]) => arm.name),
  )
}
