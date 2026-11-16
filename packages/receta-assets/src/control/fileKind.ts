import * as R from 'remeda'
import { switchCase } from '@ontologyio/receta/function'
import { none, some, type Option } from '@ontologyio/receta/option'
import { oneOf, or, startsWith } from '@ontologyio/receta/predicate'

export type FileKindLabel =
  | 'image'
  | 'video'
  | 'audio'
  | 'pdf'
  | 'spreadsheet'
  | 'presentation'
  | 'document'
  | 'archive'
  | 'text'

const SPREADSHEETS = [
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.oasis.opendocument.spreadsheet',
]
const PRESENTATIONS = [
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.oasis.opendocument.presentation',
]
const DOCUMENTS = [
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.oasis.opendocument.text',
  'application/rtf',
]
const ARCHIVES = [
  'application/zip',
  'application/gzip',
  'application/x-tar',
  'application/x-7z-compressed',
  'application/vnd.rar',
  'application/x-rar-compressed',
  'application/x-bzip2',
]
const STRUCTURED_TEXT = ['application/json', 'application/xml', 'application/yaml']

// Spreadsheets come before text, so text/csv is a spreadsheet and not plain text.
const byMimeType = switchCase<string, Option<FileKindLabel>>(
  [
    [startsWith('image/'), R.constant(some('image'))],
    [startsWith('video/'), R.constant(some('video'))],
    [startsWith('audio/'), R.constant(some('audio'))],
    [oneOf(['application/pdf']), R.constant(some('pdf'))],
    [oneOf(SPREADSHEETS), R.constant(some('spreadsheet'))],
    [oneOf(PRESENTATIONS), R.constant(some('presentation'))],
    [oneOf(DOCUMENTS), R.constant(some('document'))],
    [oneOf(ARCHIVES), R.constant(some('archive'))],
    [or(startsWith('text/'), oneOf(STRUCTURED_TEXT)), R.constant(some('text'))],
  ],
  none(),
)

/**
 * Sorts a MIME type into a kind of file, such as image, spreadsheet or archive, for icons and previews.
 *
 * Use when: a file list, an attachment chip or an upload queue shows an icon or picks a previewer
 * by the file's `type`. Parameters such as `; charset=utf-8` and letter case are ignored. CSV
 * counts as a spreadsheet; JSON, XML and YAML count as text. `None` for anything else, such as
 * `application/octet-stream`, so the caller shows a generic icon.
 *
 * @example
 * ```ts
 * fileKind('image/webp')
 * // => Some('image')
 *
 * fileKind('text/csv; charset=utf-8')
 * // => Some('spreadsheet')
 *
 * fileKind('application/vnd.openxmlformats-officedocument.wordprocessingml.document')
 * // => Some('document')
 *
 * fileKind('application/octet-stream')
 * // => None
 * ```
 *
 * @tags mime, content type, file type, icon, preview, attachment, upload, extension
 * @see switchCase - @ontologyio/receta/function, the families in order with `None` as the fallback
 * @see guardUpload - refuses files whose type isn't accepted
 */
export function fileKind(mimeType: string): Option<FileKindLabel> {
  const essence = (mimeType.split(';')[0] ?? '').trim().toLowerCase()
  return byMimeType(essence)
}
