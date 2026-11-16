import * as R from 'remeda'
import { between } from '@ontologyio/receta/predicate'
import { err, flatMap, mapErr, ok, parseInt, type Result } from '@ontologyio/receta/result'

export type ParsePortError = {
  readonly code: 'NOT_AN_INTEGER' | 'OUT_OF_RANGE'
  readonly input: string
  readonly message: string
}

const isPortNumber = between(1, 65535)

/**
 * Parses a TCP or UDP port number from a string, such as an environment variable.
 *
 * Use when: reading `PORT` or the port part of `host:port` from config, where a value
 * outside 1–65535 must stop startup instead of failing later inside `listen`.
 *
 * @example
 * ```ts
 * parsePort(' 8080 ')
 * // => Ok(8080)
 *
 * parsePort('http')
 * // => Err({ code: 'NOT_AN_INTEGER', input: 'http', message: 'Port must be a whole number, got "http"' })
 *
 * parsePort('70000')
 * // => Err({ code: 'OUT_OF_RANGE', input: '70000', message: 'Port must be between 1 and 65535, got 70000' })
 * ```
 *
 * @tags port, env, config, network, integer, range
 * @see parseInt - @ontologyio/receta/result, the integer parse underneath
 */
export function parsePort(input: string): Result<number, ParsePortError> {
  return R.pipe(
    parseInt(input.trim()),
    mapErr((): ParsePortError => ({
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
