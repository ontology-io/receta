import * as R from 'remeda'
import { clamp } from '@ontologyio/receta/number'
import { lt } from '@ontologyio/receta/predicate'

export type InRolloutPlan = {
  /** Salts the hash, so each flag picks its own set of users. */
  readonly flag: string
  /** From 0 (nobody) to 100 (everybody). Values outside are clamped. */
  readonly percent: number
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
 * Decides whether a user is in a percentage rollout, the same way every time, with no stored state.
 *
 * Use when: turning a feature on for 5%, then 25%, then 100% of users, or sampling a share of
 * requests or tenants, and the answer must not flicker between page loads or servers. The user
 * and the flag name are hashed into one of 10,000 buckets, so the same pair always gets the same
 * answer, raising the percentage only adds users, and two flags at 10% pick mostly different users.
 * Not a security boundary: anyone who knows the ids can compute the answer.
 *
 * @example
 * ```ts
 * inRollout('user-1', { flag: 'new-checkout', percent: 100 })
 * // => true
 *
 * inRollout('user-1', { flag: 'new-checkout', percent: 0 })
 * // => false
 *
 * const users = R.map(R.range(0, 1000), (n) => `user-${n}`)
 * R.filter(users, inRollout({ flag: 'new-checkout', percent: 20 })).length
 * // => 201
 * ```
 *
 * @tags feature flag, rollout, percentage, canary, sampling, bucket, hash, gradual release
 * @see clamp - @ontologyio/receta/number, keeps the percentage between 0 and 100
 * @see assignVariant - splits users between several named variants by weight
 * @see applyIfEnabled - applies a step when a flag is on
 */
export function inRollout(subjectId: string, plan: InRolloutPlan): boolean
export function inRollout(plan: InRolloutPlan): (subjectId: string) => boolean
export function inRollout(...args: unknown[]): unknown {
  return R.purry(inRolloutImplementation, args)
}

const inRolloutImplementation = (subjectId: string, plan: InRolloutPlan): boolean => {
  const bucket = hash32(`${plan.flag}:${subjectId}`) % 10_000
  return lt(clamp(plan.percent, 0, 100) * 100)(bucket)
}
