import * as R from 'remeda'
import { between, matches } from '@ontologyio/receta/predicate'
import { err, flatMap, mapErr, ok, parseNumber, type Result } from '@ontologyio/receta/result'

export type ParsePortError = {
  readonly code: 'NOT_AN_INTEGER' | 'OUT_OF_RANGE'
  readonly input: string
  readonly message: string
}

// Digits only: Receta's parseInt reads '80abc' as 80, and Number reads '1e3' as 1000.
const isDigits = matches(/^\d+$/)
const isPortNumber = between(1, 65535)

/**
 * Parses a TCP or UDP port number from a string, such as an environment variable.
 *
 * Use when: reading `PORT` or the port part of `host:port` from config, where a value
 * outside 1–65535 must stop startup instead of failing later inside `listen`. Only digits
 * count, after trimming: `80abc`, `1e3` and `80.0` are rejected.
 *
 * @example
 * ```ts
 * parsePort(' 8080 ')
 * // => Ok(8080)
 *
 * parsePort('80abc')
 * // => Err({ code: 'NOT_AN_INTEGER', input: '80abc', message: 'Port must be a whole number, got "80abc"' })
 *
 * parsePort('70000')
 * // => Err({ code: 'OUT_OF_RANGE', input: '70000', message: 'Port must be between 1 and 65535, got 70000' })
 * ```
 *
 * @tags port, env, config, network, integer, range
 * @see parseNumber - @ontologyio/receta/result, the number parse underneath
 */
export function parsePort(input: string): Result<number, ParsePortError> {
  const text = input.trim()
  return R.pipe(
    isDigits(text) ? parseNumber(text) : err('not digits'),
    mapErr((_reason: unknown): ParsePortError => ({
      code: 'NOT_AN_INTEGER',
      input,
      message: `Port must be a whole number, got "${input}"`,
    })),
    flatMap((port) =>
      isPortNumber(port)
        ? ok(port)
        : err<ParsePortError>({
            code: 'OUT_OF_RANGE',
            input,
            message: `Port must be between 1 and 65535, got ${port}`,
          }),
    ),
  )
}
