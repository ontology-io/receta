import * as R from 'remeda'
import { round, sum } from '@ontologyio/receta/number'
import { err, ok, type Result } from '@ontologyio/receta/result'
import { isBlank } from '@ontologyio/receta/string'

export type ParseDurationMsError = {
  readonly code: 'INVALID_DURATION'
  readonly input: string
  readonly message: string
}

const PART = /(\d+(?:\.\d+)?)\s*(ms|s|m|h|d|w)/g
const BARE_NUMBER = /^\d+(?:\.\d+)?$/

const UNIT_MS: Readonly<Record<string, number>> = {
  ms: 1,
  s: 1000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
  w: 604_800_000,
}

/**
 * Parses a human duration such as `90s`, `5m`, `1h30m` or `1.5d` into milliseconds.
 *
 * Use when: a timeout, TTL, cache lifetime, polling interval or session length is set in
 * config or by a person, and `CACHE_TTL=15m` is easier to get right than `900000`. Units
 * are `ms`, `s`, `m`, `h`, `d` and `w`, in any case, and parts add up, with or without
 * spaces: `1h 30m`. A bare number is milliseconds. Negative values, unknown units and
 * leftover text are an `Err`. The total is rounded to a whole millisecond.
 *
 * @example
 * ```ts
 * parseDurationMs('90s')
 * // => Ok(90000)
 *
 * parseDurationMs('1h 30m')
 * // => Ok(5400000)
 *
 * parseDurationMs('250')
 * // => Ok(250)
 *
 * parseDurationMs('5 minutes')
 * // => Err({ code: 'INVALID_DURATION', input: '5 minutes', message: 'Expected a duration such as 250ms, 90s, 5m, 1h30m or 2d, got "5 minutes"' })
 * ```
 *
 * @tags duration, timeout, ttl, interval, time, ms, milliseconds, config, env
 * @see sum - @ontologyio/receta/number, adds the parts up
 * @see parseByteSize - the same idea for sizes such as 10MB
 */
export function parseDurationMs(input: string): Result<number, ParseDurationMsError> {
  const text = R.toLowerCase(input.trim())
  const leftover = text.replace(PART, '').trim()
  if (BARE_NUMBER.test(text)) return ok(round(Number(text), 0))
  if (isBlank(text) || !isBlank(leftover)) {
    return err({
      code: 'INVALID_DURATION',
      input,
      message: `Expected a duration such as 250ms, 90s, 5m, 1h30m or 2d, got "${input}"`,
    })
  }
  const parts = R.map([...text.matchAll(PART)], ([, amount = '0', unit = 'ms']) =>
    Number(amount) * (UNIT_MS[unit] ?? 0),
  )
  return ok(round(sum(parts), 0))
}
