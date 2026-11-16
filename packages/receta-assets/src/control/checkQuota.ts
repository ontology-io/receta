import * as R from 'remeda'
import { guard } from '@ontologyio/receta/function'
import { flatMap, fromNullable, map, toResult, type Option } from '@ontologyio/receta/option'
import { by, eq, gt, gte } from '@ontologyio/receta/predicate'
import { flatMap as andThen, map as mapOk, type Result } from '@ontologyio/receta/result'

/** Per plan, how many of each feature it includes. `Infinity` is unlimited; a missing feature is not included. */
export type CheckQuotaLimits<P extends string, F extends string> = Readonly<
  Record<P, Readonly<Partial<Record<F, number>>>>
>

export type CheckQuotaRequest<P extends string, F extends string> = {
  readonly plan: P
  readonly feature: F
  /** How many are in use now. */
  readonly used: number
  /** How many the action adds, usually 1. */
  readonly adding: number
}

export type CheckQuotaError = {
  readonly code: 'NOT_IN_PLAN' | 'QUOTA_EXCEEDED'
  readonly input: { readonly plan: string; readonly feature: string }
  /** The plan's limit for the feature, 0 when the plan doesn't include it. */
  readonly limit: number
  readonly message: string
}

const own = <V>(record: Readonly<Record<string, V>>, key: string): Option<V> =>
  R.pipe(
    R.find(R.entries(record), by(([name]) => name, eq(key))),
    fromNullable,
    map(([, value]) => value),
  )

/**
 * Checks a plan's limit before an action that uses more of a feature, and says how many are left after it.
 *
 * Use when: a SaaS app gates creating a project, inviting a seat or adding an integration by the
 * customer's plan, and the UI needs an upgrade prompt with a reason. `NOT_IN_PLAN` when the plan
 * doesn't list the feature or lists 0; `QUOTA_EXCEEDED` when `used + adding` would pass the
 * limit. Use `Infinity` for unlimited. The `Ok` holds what remains once the action is done.
 *
 * @example
 * ```ts
 * const plans = {
 *   free: { projects: 3 },
 *   team: { projects: 50, seats: 10 },
 *   enterprise: { projects: Infinity, seats: Infinity },
 * }
 *
 * checkQuota({ plan: 'team', feature: 'seats', used: 7, adding: 2 }, plans)
 * // => Ok({ remaining: 1 })
 *
 * checkQuota({ plan: 'free', feature: 'projects', used: 3, adding: 1 }, plans)
 * // => Err({ code: 'QUOTA_EXCEEDED', input: { plan: 'free', feature: 'projects' }, limit: 3, message: 'The free plan includes 3 projects and 3 are in use' })
 *
 * R.pipe({ plan: 'free', feature: 'seats', used: 0, adding: 1 } as const, checkQuota(plans))
 * // => Err({ code: 'NOT_IN_PLAN', input: { plan: 'free', feature: 'seats' }, limit: 0, message: 'The free plan doesn\'t include seats' })
 * ```
 *
 * @tags quota, limit, plan, entitlement, saas, billing, seats, upgrade, usage, guard
 * @see guard - @ontologyio/receta/function, the included and within-limit checks in order
 * @see toResult - @ontologyio/receta/option, a feature missing from the plan becomes the error
 * @see guardWithdrawal - the same kind of gate for money
 */
export function checkQuota<P extends string, F extends string>(
  request: CheckQuotaRequest<P, F>,
  limits: CheckQuotaLimits<P, F>,
): Result<{ readonly remaining: number }, CheckQuotaError>
export function checkQuota<P extends string, F extends string>(
  limits: CheckQuotaLimits<P, F>,
): (request: CheckQuotaRequest<P, F>) => Result<{ readonly remaining: number }, CheckQuotaError>
export function checkQuota(...args: unknown[]): unknown {
  return R.purry(checkQuotaImplementation, args)
}

const checkQuotaImplementation = <P extends string, F extends string>(
  request: CheckQuotaRequest<P, F>,
  limits: CheckQuotaLimits<P, F>,
): Result<{ readonly remaining: number }, CheckQuotaError> => {
  const { plan, feature, used, adding } = request
  const input = { plan, feature }
  const notInPlan: CheckQuotaError = {
    code: 'NOT_IN_PLAN',
    input,
    limit: 0,
    message: `The ${plan} plan doesn't include ${feature}`,
  }
  const features = limits as Readonly<Record<string, Readonly<Record<string, number | undefined>>>>
  return R.pipe(
    own(features, plan),
    flatMap((included) => own(included, feature)),
    flatMap(fromNullable),
    toResult(notInPlan),
    andThen((limit) =>
      guard<number, CheckQuotaError>(
        [
          [gt(0), notInPlan],
          [
            gte(used + adding),
            {
              code: 'QUOTA_EXCEEDED',
              input,
              limit,
              message: `The ${plan} plan includes ${limit} ${feature} and ${used} are in use`,
            },
          ],
        ],
        limit,
      ),
    ),
    mapOk((limit) => ({ remaining: limit - used - adding })),
  )
}
