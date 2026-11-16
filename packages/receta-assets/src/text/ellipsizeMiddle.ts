import * as R from 'remeda'
import { truncate } from '@ontologyio/receta/string'

/**
 * Shortens text to `maxLength` characters by cutting the middle: `0x71C7…d8976F`.
 *
 * Use when: the start and the end both identify the value, as with wallet addresses,
 * commit hashes, file paths and file names with versions or extensions, and the column is
 * too narrow for all of it. The `…` counts toward `maxLength`; when the kept characters
 * don't split evenly, the start gets the extra one. Text that fits comes back unchanged.
 *
 * @example
 * ```ts
 * ellipsizeMiddle('0x71C7656EC7ab88b098defB751B7401B5f6d8976F', 13)
 * // => '0x71C7…d8976F'
 *
 * ellipsizeMiddle('invoice-2024-03-final.pdf', 16)
 * // => 'invoice-…nal.pdf'
 *
 * R.pipe('short.txt', ellipsizeMiddle(16))
 * // => 'short.txt'
 * ```
 *
 * @tags ellipsis, truncate, middle, shorten, hash, address, path, file name
 * @see truncate - @ontologyio/receta/string, cuts the end instead of the middle
 */
export function ellipsizeMiddle(text: string, maxLength: number): string
export function ellipsizeMiddle(maxLength: number): (text: string) => string
export function ellipsizeMiddle(...args: unknown[]): unknown {
  return R.purry(ellipsizeMiddleImplementation, args)
}

const ellipsizeMiddleImplementation = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  const kept = Math.max(maxLength - 1, 0)
  const tail = Math.floor(kept / 2)
  // truncate keeps length - 1 characters and adds the `…`, so this is the start plus `…`.
  const head = truncate(text, { length: kept - tail + 1, ellipsis: '…' })
  return `${head}${text.slice(text.length - tail)}`
}
