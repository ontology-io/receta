import * as R from 'remeda'
import { guard, switchCase } from '@ontologyio/receta/function'
import { and, between, eq, isFiniteNumber, lt } from '@ontologyio/receta/predicate'
import { map, type Result } from '@ontologyio/receta/result'

export type CvssSeverityLabel = 'none' | 'low' | 'medium' | 'high' | 'critical'

export type CvssSeverityError = {
  readonly code: 'OUT_OF_RANGE'
  readonly input: number
  readonly message: string
}

const toLabel = switchCase<number, CvssSeverityLabel>(
  [
    [eq(0), R.constant('none')],
    [lt(4), R.constant('low')],
    [lt(7), R.constant('medium')],
    [lt(9), R.constant('high')],
  ],
  'critical',
)

/**
 * Turns a CVSS base score into its severity: none, low, medium, high or critical.
 *
 * Use when: a vulnerability scanner, a dependency audit or an advisory feed gives a numeric
 * score and a report, a badge or a CI gate needs the word. Uses the CVSS v3 and v4 bands:
 * 0 none, 0.1–3.9 low, 4.0–6.9 medium, 7.0–8.9 high, 9.0–10.0 critical. A score outside 0–10,
 * or not a number, is an error rather than a guess.
 *
 * @example
 * ```ts
 * cvssSeverity(7.5)
 * // => Ok('high')
 *
 * cvssSeverity(9)
 * // => Ok('critical')
 *
 * cvssSeverity(0)
 * // => Ok('none')
 *
 * cvssSeverity(11)
 * // => Err({ code: 'OUT_OF_RANGE', input: 11, message: 'A CVSS score is between 0 and 10, got 11' })
 * ```
 *
 * @tags cvss, severity, vulnerability, security, cve, audit, score, risk
 * @see guard - @ontologyio/receta/function, refuses scores outside 0–10
 * @see bandOf - labels for thresholds you choose
 */
export function cvssSeverity(score: number): Result<CvssSeverityLabel, CvssSeverityError> {
  const outOfRange: CvssSeverityError = {
    code: 'OUT_OF_RANGE',
    input: score,
    message: `A CVSS score is between 0 and 10, got ${score}`,
  }
  return R.pipe(guard([[and(isFiniteNumber, between(0, 10)), outOfRange]], score), map(toLabel))
}
