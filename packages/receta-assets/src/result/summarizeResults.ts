import * as R from 'remeda'
import { partition, type Result } from '@ontologyio/receta/result'

export type SummarizeResultsSummary = {
  readonly total: number
  readonly succeeded: number
  readonly failed: number
  /** How many failures had each error code, such as `{ BOUNCED: 2, TIMEOUT: 1 }`. */
  readonly failuresByCode: Readonly<Record<string, number>>
}

/**
 * Counts a batch's Results: how many succeeded, how many failed, and how many failures had each error code.
 *
 * Use when: a job, an import or a fan-out finished and needs a one-line report, a metric or
 * an alert rule, such as "sent 120, failed 3 (BOUNCED 2, TIMEOUT 1)", without keeping the
 * values. Errors must have a `code`. An empty batch is all zeros.
 *
 * ```text
 *  STEP               DATA AFTER IT
 *  ─────────────────  ────────────────────────────────────────────────────
 *  results            [Ok, Err(BOUNCED), Ok, Err(TIMEOUT), Err(BOUNCED)]
 *  partition          [[2 values], [BOUNCED, TIMEOUT, BOUNCED]]
 *  R.countBy(code)    { BOUNCED: 2, TIMEOUT: 1 }
 *  summary            { total 5, succeeded 2, failed 3, failuresByCode }
 * ```
 *
 * @example
 * ```ts
 * import { err, ok, type Result } from '@ontologyio/receta/result'
 *
 * type SendError = { code: 'BOUNCED' | 'TIMEOUT' }
 * const sends: Result<string, SendError>[] = [
 *   ok('m1'),
 *   err({ code: 'BOUNCED' }),
 *   ok('m2'),
 *   err({ code: 'TIMEOUT' }),
 *   err({ code: 'BOUNCED' }),
 * ]
 *
 * summarizeResults(sends)
 * // => { total: 5, succeeded: 2, failed: 3, failuresByCode: { BOUNCED: 2, TIMEOUT: 1 } }
 *
 * summarizeResults([])
 * // => { total: 0, succeeded: 0, failed: 0, failuresByCode: {} }
 * ```
 *
 * @tags summary, count, report, batch, metrics, stats, error codes, job
 * @see settleResults - keeps the values and the failed items, not just counts
 * @see partition - @ontologyio/receta/result, the split underneath
 */
export function summarizeResults<T, E extends { readonly code: string }>(
  results: readonly Result<T, E>[],
): SummarizeResultsSummary {
  const [values, errors] = partition(results)
  return {
    total: results.length,
    succeeded: values.length,
    failed: errors.length,
    failuresByCode: R.countBy(errors, (error): string => error.code),
  }
}
