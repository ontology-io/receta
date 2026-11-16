import * as R from 'remeda'
import { normalizeWhitespace, truncate } from '@ontologyio/receta/string'

const MAX_BASE_LENGTH = 100
const SEPARATORS = /[/\\:|]+/g
// Characters Windows, macOS or Linux refuse in a name, and control characters.
const FORBIDDEN = /[<>"?*\u0000-\u001f\u007f]/g
const WINDOWS_RESERVED = /^(?:con|prn|aux|nul|com\d|lpt\d)$/i

const splitExtension = (name: string): readonly [string, string] => {
  const dot = name.lastIndexOf('.')
  return dot > 0 ? [name.slice(0, dot), name.slice(dot)] : [name, '']
}

/**
 * Makes a string safe to use as a file name on Windows, macOS and Linux, keeping it readable.
 *
 * Use when: saving an upload, an export or a generated report under a name a user typed or
 * a title from your data. Slashes, backslashes, colons and pipes become `-`; other
 * forbidden characters go. Whitespace collapses, leading and trailing dots and spaces go,
 * reserved Windows names such as `CON` get a `_` in front, and the part before the
 * extension is cut to 100 characters. The extension is kept. A name with nothing left
 * becomes `untitled`.
 *
 * @example
 * ```ts
 * safeFileName('Q3 report: final/v2?.pdf')
 * // => 'Q3 report- final-v2.pdf'
 *
 * safeFileName('  ..con.txt ')
 * // => '_con.txt'
 *
 * safeFileName('???')
 * // => 'untitled'
 * ```
 *
 * @tags file name, filename, sanitize, path, download, export, upload, windows
 * @see normalizeWhitespace - @ontologyio/receta/string, collapses the spaces
 * @see truncate - @ontologyio/receta/string, caps the length before the extension
 */
export function safeFileName(name: string): string {
  const cleaned = R.pipe(
    name.replace(SEPARATORS, '-').replace(FORBIDDEN, ''),
    normalizeWhitespace,
    (text) => text.replace(/^[.\s]+|[.\s]+$/g, ''),
  )
  const [base, extension] = splitExtension(cleaned)
  const short = truncate(base, { length: MAX_BASE_LENGTH, ellipsis: '' }).trim()
  const safeBase = WINDOWS_RESERVED.test(short) ? `_${short}` : short
  return safeBase === '' ? `untitled${extension}` : `${safeBase}${extension}`
}
