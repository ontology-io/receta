import * as R from 'remeda'
import { isInteger } from '@ontologyio/receta/number'
import { and, between, matches } from '@ontologyio/receta/predicate'
import { err, flatMap, fromNullable, map, mapErr, ok, parseNumber, type Result } from '@ontologyio/receta/result'
import { isBlank } from '@ontologyio/receta/string'

export type ParseHostPortError = {
  readonly code: 'MISSING_HOST' | 'MISSING_PORT' | 'INVALID_PORT'
  readonly input: string
  readonly message: string
}

export type ParseHostPortAddress = {
  /** The host name or IP address, without brackets for IPv6. */
  readonly host: string
  readonly port: number
}

const BRACKETED = /^\[([^\]]*)\](?::(.*))?$/
const PLAIN = /^([^:]*)(?::(.*))?$/
const isPortNumber = and(isInteger, between(1, 65535))
const isDigits = matches(/^\d+$/)

/**
 * Splits an address such as `db.internal:5432` or `[::1]:6379` into a host and a numeric port.
 *
 * Use when: a database, cache, broker or upstream address is configured as one
 * `host:port` string, such as `REDIS_ADDR`, and a missing or bad port must stop startup with
 * a clear reason. IPv6 hosts need brackets, as in URLs, and come back without them. The port
 * must be digits only, from 1 to 65535, so `80abc` and `1e3` are refused.
 *
 * @example
 * ```ts
 * parseHostPort('db.internal:5432')
 * // => Ok({ host: 'db.internal', port: 5432 })
 *
 * parseHostPort('[::1]:6379')
 * // => Ok({ host: '::1', port: 6379 })
 *
 * parseHostPort('db.internal')
 * // => Err({ code: 'MISSING_PORT', input: 'db.internal', message: 'Expected host:port, got "db.internal"' })
 *
 * parseHostPort('localhost:80abc')
 * // => Err({ code: 'INVALID_PORT', input: 'localhost:80abc', message: 'Port must be a whole number from 1 to 65535, got "80abc"' })
 * ```
 *
 * @tags host, port, address, socket, endpoint, ipv6, redis, database, config, env
 * @see parsePort - the port alone
 * @see between - @ontologyio/receta/predicate, the port range
 */
export function parseHostPort(input: string): Result<ParseHostPortAddress, ParseHostPortError> {
  const text = input.trim()
  const [, host = '', port] = BRACKETED.exec(text) ?? PLAIN.exec(text) ?? []
  if (isBlank(host)) {
    return err({ code: 'MISSING_HOST', input, message: `Expected a host before the port, got "${input}"` })
  }
  return R.pipe(
    fromNullable(port, {
      code: 'MISSING_PORT',
      input,
      message: `Expected host:port, got "${input}"`,
    } satisfies ParseHostPortError),
    flatMap((portText) =>
      R.pipe(
        // Digits only: parseNumber alone takes '1e3' and '0x10', and Receta's parseInt reads '12abc' as 12.
        isDigits(portText) ? parseNumber(portText) : err(undefined),
        flatMap((value) => (isPortNumber(value) ? ok(value) : err(undefined))),
        mapErr((): ParseHostPortError => ({
          code: 'INVALID_PORT',
          input,
          message: `Port must be a whole number from 1 to 65535, got "${portText}"`,
        })),
      ),
    ),
    map((portNumber) => ({ host, port: portNumber })),
  )
}
