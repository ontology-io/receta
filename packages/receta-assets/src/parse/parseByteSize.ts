import * as R from 'remeda'
import { fromBytes, round } from '@ontologyio/receta/number'
import { gte } from '@ontologyio/receta/predicate'
import { err, flatMap, mapErr, ok, parseNumber, type Result } from '@ontologyio/receta/result'

export type ParseByteSizeError = {
  readonly code: 'INVALID_SIZE'
  readonly input: string
  readonly message: string
}

/** `10 MiB` and friends: the `i` means powers of 1024. */
const BINARY_UNIT = /^(\d+(?:\.\d+)?)\s*([kmgtp])ib$/i
const BARE_NUMBER = /^\d+(?:\.\d+)?$/

const toBytes = (text: string): Result<number, unknown> => {
  const binary = BINARY_UNIT.exec(text)
  if (binary) return fromBytes(`${binary[1]}${binary[2]}B`, 'binary')
  if (BARE_NUMBER.test(text)) return parseNumber(text)
  return fromBytes(text, 'decimal')
}

/**
 * Parses a size such as `512`, `10MB` or `1.5 GiB` into a whole number of bytes.
 *
 * Use when: an upload limit, a cache size, a disk quota or a body-size cap is set in config
 * as text. `KB`, `MB`, `GB`, `TB` and `PB` are powers of 1000 and `KiB`, `MiB`, `GiB`,
 * `TiB` and `PiB` are powers of 1024, as the units are defined; units ignore case, and a bare
 * number is bytes. Negative sizes and unknown units are an `Err`. The result is rounded to a
 * whole byte.
 *
 * @example
 * ```ts
 * parseByteSize('10MB')
 * // => Ok(10000000)
 *
 * parseByteSize('1.5 GiB')
 * // => Ok(1610612736)
 *
 * parseByteSize('512')
 * // => Ok(512)
 *
 * parseByteSize('10 megs')
 * // => Err({ code: 'INVALID_SIZE', input: '10 megs', message: 'Expected a size such as 512, 10MB or 1.5GiB, got "10 megs"' })
 * ```
 *
 * @tags bytes, size, upload limit, quota, megabytes, mib, filesize, config
 * @see fromBytes - @ontologyio/receta/number, reads one unit in one base
 * @see toBytes - @ontologyio/receta/number, formats bytes back to text
 */
export function parseByteSize(input: string): Result<number, ParseByteSizeError> {
  return R.pipe(
    toBytes(input.trim()),
    flatMap((bytes) => (gte(0)(bytes) ? ok(round(bytes, 0)) : err(undefined))),
    mapErr((): ParseByteSizeError => ({
      code: 'INVALID_SIZE',
      input,
      message: `Expected a size such as 512, 10MB or 1.5GiB, got "${input}"`,
    })),
  )
}
