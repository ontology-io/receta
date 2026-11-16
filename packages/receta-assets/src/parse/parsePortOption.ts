import * as R from 'remeda'
import { isInteger } from '@ontologyio/receta/number'
import { filter, flatMap, fromNullable, fromResult, map, type Option } from '@ontologyio/receta/option'
import { and, between, matches } from '@ontologyio/receta/predicate'
import { parseNumber } from '@ontologyio/receta/result'
import { trim } from '@ontologyio/receta/string'

const isPortNumber = and(isInteger, between(1, 65535))
const isDigits = matches(/^\d+$/)

/**
 * Reads a TCP or UDP port from a string that may be missing, as Some(port) or None.
 *
 * Use when: a port is optional and a default should take over when it is missing or
 * unusable, such as `PORT` in development. Blank, out-of-range and non-digit values, such as
 * `80abc` or `1e3`, all come back as None, so pair it with `unwrapOr` for the default. When a bad value must stop
 * startup with a reason, use `parsePort` instead.
 *
 * @example
 * ```ts
 * import { unwrapOr } from '@ontologyio/receta/option'
 *
 * parsePortOption('8080')
 * // => Some(8080)
 *
 * parsePortOption('80abc')
 * // => None
 *
 * parsePortOption('1e3')
 * // => None
 *
 * unwrapOr(parsePortOption(undefined), 3000)
 * // => 3000
 * ```
 *
 * @tags port, env, config, optional, default, network
 * @see parsePort - the Result variant, with the reason a value was refused
 * @see fromResult - @ontologyio/receta/option, drops the parse error
 */
export function parsePortOption(input: string | undefined): Option<number> {
  return R.pipe(
    fromNullable(input),
    map(trim),
    // Digits only: parseNumber alone takes '1e3' and '0x10', and Receta's parseInt reads '80abc' as 80.
    filter(isDigits),
    flatMap((text) => fromResult(parseNumber(text))),
    filter(isPortNumber),
  )
}
