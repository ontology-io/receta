import { toBytes } from '@ontologyio/receta/number'

/**
 * Formats a byte count in powers of 1024 with IEC units, so nobody mistakes them: `1.5 MiB`.
 *
 * Use when: showing memory, disk quotas or sizes next to tools that count in 1024s, such
 * as Windows Explorer, `ls -h` or a container's memory limit. Units are `KiB`, `MiB`,
 * `GiB`, `TiB` and `PiB`, one decimal at most, and a trailing `.0` is dropped. Counts below
 * 1024 read as bytes. For powers of 1000, as macOS shows sizes, use `formatFileSize`.
 *
 * @example
 * ```ts
 * formatFileSizeBinary(1_572_864)
 * // => '1.5 MiB'
 *
 * formatFileSizeBinary(1024)
 * // => '1 KiB'
 *
 * formatFileSizeBinary(1000)
 * // => '1000 B'
 * ```
 *
 * @tags file size, bytes, kib, mib, gib, memory, binary, iec, storage
 * @see toBytes - @ontologyio/receta/number, picks the unit, labelled KB for 1024 bytes
 * @see formatFileSize - KB, MB and GB in powers of 1000
 */
export function formatFileSizeBinary(bytes: number): string {
  return toBytes(bytes, { base: 'binary', decimals: 1 })
    .replace(/\.0(?= )/, '')
    .replace(/ ([KMGTP])B$/, ' $1iB')
}
