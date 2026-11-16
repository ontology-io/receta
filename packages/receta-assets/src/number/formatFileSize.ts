import { toBytes } from '@ontologyio/receta/number'

/**
 * Formats a byte count the way macOS and storage vendors do, in powers of 1000: `1.5 MB`.
 *
 * Use when: showing upload limits, attachment sizes or download progress to people. One
 * decimal at most, and a trailing `.0` is dropped, so `1000000` reads `1 MB`, not
 * `1.0 MB`. Counts below 1000 read as bytes, such as `999 B`. For sizes in powers of 1024,
 * as Windows and most Linux tools show them, use `formatFileSizeBinary`.
 *
 * @example
 * ```ts
 * formatFileSize(1_500_000)
 * // => '1.5 MB'
 *
 * formatFileSize(1_000_000)
 * // => '1 MB'
 *
 * formatFileSize(999)
 * // => '999 B'
 * ```
 *
 * @tags file size, bytes, kb, mb, gb, storage, upload, download, human readable
 * @see toBytes - @ontologyio/receta/number, picks the unit
 * @see formatFileSizeBinary - KiB, MiB and GiB in powers of 1024
 */
export function formatFileSize(bytes: number): string {
  return toBytes(bytes, { base: 'decimal', decimals: 1 }).replace(/\.0(?= )/, '')
}
