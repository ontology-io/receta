import type { Result } from '../../result/types'
import { ok, err } from '../../result/constructors'
import type { ParseError, ByteUnit } from '../types'

/**
 * Parses a byte size string into a number of bytes.
 *
 * Handles common formats: "1KB", "1.5 MB", "2GB".
 * Supports both binary (1024) and decimal (1000) bases.
 * Case-insensitive unit parsing.
 *
 * The IEC units (KiB, MiB, GiB, TiB, PiB) are powers of 1024 by definition, so `base`
 * only decides what KB, MB, GB, TB and PB mean.
 *
 * @param input - The byte string to parse
 * @param base - Whether to use binary (1024) or decimal (1000) units
 * @returns Result containing the number of bytes or an error
 *
 * @example
 * ```typescript
 * fromBytes("1KB") // => Ok(1024)
 * fromBytes("1.5 MB") // => Ok(1572864)
 * fromBytes("2GB") // => Ok(2147483648)
 * fromBytes("100 B") // => Ok(100)
 * fromBytes("1KB", 'decimal') // => Ok(1000)
 * fromBytes("1 KiB") // => Ok(1024)
 * fromBytes("1 KiB", 'decimal') // => Ok(1024)
 * fromBytes("invalid") // => Err({ code: 'PARSE_ERROR', ... })
 *
 * // Real-world: Parse file size limit
 * const validateFileSize = (sizeStr: string, maxStr: string) =>
 *   pipe(
 *     collect([fromBytes(sizeStr), fromBytes(maxStr)]),
 *     map(([size, max]) => size <= max)
 *   )
 * ```
 *
 * @see toBytes - for formatting bytes as strings
 */
export function fromBytes(
  input: string,
  base: 'binary' | 'decimal' = 'binary'
): Result<number, ParseError> {
  const trimmed = input.trim()

  if (trimmed === '') {
    return err({
      code: 'PARSE_ERROR',
      message: 'Cannot parse empty string',
      input,
    })
  }

  // Parse format: "123.45 MB" or "123.45MB"
  const match = trimmed.match(/^(-?\d+(?:\.\d+)?)\s*([A-Za-z]+)$/)

  if (!match) {
    return err({
      code: 'PARSE_ERROR',
      message: `Invalid byte format: "${input}"`,
      input,
    })
  }

  const [, numStr, unitStr] = match

  if (!numStr || !unitStr) {
    return err({
      code: 'PARSE_ERROR',
      message: `Invalid byte format: "${input}"`,
      input,
    })
  }

  const num = Number(numStr)

  if (Number.isNaN(num)) {
    return err({
      code: 'PARSE_ERROR',
      message: `Cannot parse numeric value: "${numStr}"`,
      input,
    })
  }

  // KiB, MiB… are always binary. KIB becomes KB so both spellings share one table.
  const upper = unitStr.toUpperCase()
  const isIec = /^[KMGTP]IB$/.test(upper)
  const unit = isIec ? upper.replace('IB', 'B') : upper
  const divisor = isIec || base === 'binary' ? 1024 : 1000

  if (!Object.hasOwn(UNIT_EXPONENTS, unit)) {
    return err({
      code: 'PARSE_ERROR',
      message: `Unknown byte unit: "${unitStr}"`,
      input,
    })
  }

  return ok(num * divisor ** UNIT_EXPONENTS[unit as ByteUnit])
}

const UNIT_EXPONENTS: Readonly<Record<ByteUnit, number>> = {
  B: 0,
  KB: 1,
  MB: 2,
  GB: 3,
  TB: 4,
  PB: 5,
}
