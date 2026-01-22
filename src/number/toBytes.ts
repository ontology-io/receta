import * as R from 'remeda'
import type { ByteOptions } from './types'

/**
 * Formats a number as a byte size string (KB, MB, GB, etc.).
 *
 * Automatically selects the appropriate unit based on the value.
 * Supports both binary (1024) and decimal (1000) bases.
 *
 * @param value - The number of bytes
 * @param options - Byte formatting options
 * @returns The formatted byte string
 *
 * @example
 * ```typescript
 * // Data-first (binary by default)
 * toBytes(1024) // => "1.00 KB"
 * toBytes(1048576) // => "1.00 MB"
 * toBytes(1536, { decimals: 0 }) // => "2 KB"
 * toBytes(1000, { base: 'decimal' }) // => "1.00 KB"
 *
 * // Data-last (in pipe)
 * pipe(
 *   fileSize,
 *   toBytes({ decimals: 1 })
 * )
 *
 * // Real-world: File size display
 * const displayFileSize = (bytes: number) =>
 *   bytes < 1024 ? `${bytes} B` : toBytes(bytes, { decimals: 1 })
 * ```
 *
 * @see fromBytes - for parsing byte strings
 */
export function toBytes(value: number, options?: ByteOptions): string
export function toBytes(options?: ByteOptions): (value: number) => string
export function toBytes(...args: any[]): any {
  // Data-first: toBytes(value, options?)
  if (args.length >= 1 && typeof args[0] === 'number') {
    return toBytesImpl(args[0], args[1])
  }

  // Data-last: toBytes(options?)
  const options = args[0]
  return (value: number) => toBytesImpl(value, options)
}

function toBytesImpl(value: number, options: ByteOptions = {}): string {
  const { decimals = 2, base = 'binary' } = options
  const divisor = base === 'binary' ? 1024 : 1000
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']

  let size = Math.abs(value)
  let unitIndex = 0

  while (size >= divisor && unitIndex < units.length - 1) {
    size /= divisor
    unitIndex++
  }

  const sign = value < 0 ? '-' : ''
  const formatted = unitIndex === 0 ? size.toString() : size.toFixed(decimals)

  return `${sign}${formatted} ${units[unitIndex]}`
}
