import * as R from 'remeda'
import { round } from '@ontologyio/receta/number'
import { map, mapErr, parseNumber, type Result } from '@ontologyio/receta/result'

export type ParsePercentError = {
  readonly code: 'NOT_A_PERCENT'
  readonly input: string
  readonly message: string
}

/**
 * Parses a percentage such as `45%` or `12.5` into a fraction: `45%` becomes 0.45.
 *
 * Use when: a rate, discount, tax, threshold or progress value is typed as a percentage and
 * the code computes with fractions. The `%` sign is optional and the number always counts
 * as percentage points, so `0.5` means half a percent (0.005), not 50%. Values below 0 or
 * above 100 are kept, because growth and change rates can be anywhere; check the range
 * after if it matters. The result is rounded to 10 decimals to drop float noise.
 *
 * @example
 * ```ts
 * parsePercent('45%')
 * // => Ok(0.45)
 *
 * parsePercent(' 12.5 % ')
 * // => Ok(0.125)
 *
 * parsePercent('14.3')
 * // => Ok(0.143)
 *
 * parsePercent('half')
 * // => Err({ code: 'NOT_A_PERCENT', input: 'half', message: 'Expected a percentage such as 45% or 12.5, got "half"' })
 * ```
 *
 * @tags percent, percentage, rate, discount, tax, fraction, ratio
 * @see parseNumber - @ontologyio/receta/result, the number parse underneath
 * @see toPercent - @ontologyio/receta/number, formats a fraction back to text
 */
export function parsePercent(input: string): Result<number, ParsePercentError> {
  return R.pipe(
    parseNumber(input.trim().replace(/\s*%$/, '')),
    map((points) => round(points / 100, 10)),
    mapErr((): ParsePercentError => ({
      code: 'NOT_A_PERCENT',
      input,
      message: `Expected a percentage such as 45% or 12.5, got "${input}"`,
    })),
  )
}
