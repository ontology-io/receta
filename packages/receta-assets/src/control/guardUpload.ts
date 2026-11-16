import * as R from 'remeda'
import { guard } from '@ontologyio/receta/function'
import { toBytes } from '@ontologyio/receta/number'
import { gt, lte, startsWith, where } from '@ontologyio/receta/predicate'
import type { Result } from '@ontologyio/receta/result'

/** The fields a browser `File` or a multipart upload already has. */
export type GuardUploadFile = {
  readonly name: string
  readonly size: number
  readonly type: string
}

export type GuardUploadOptions = {
  readonly maxBytes: number
  /** Like an `<input accept>`: `image/*`, `application/pdf`, `.csv`. Empty accepts any type. */
  readonly accept: readonly string[]
}

export type GuardUploadError = {
  readonly code: 'EMPTY' | 'TOO_LARGE' | 'TYPE_NOT_ALLOWED'
  /** The file's name. */
  readonly input: string
  readonly message: string
}

/** Whether a file matches one `accept` entry: an extension, a `type/*` family, or an exact type. */
const matchesAccept =
  (file: GuardUploadFile) =>
  (entry: string): boolean => {
    const wanted = entry.trim().toLowerCase()
    const mime = (file.type.split(';')[0] ?? '').trim().toLowerCase()
    if (startsWith('.')(wanted)) return file.name.toLowerCase().endsWith(wanted)
    if (wanted.endsWith('/*')) return startsWith(wanted.slice(0, -1))(mime)
    return mime === wanted
  }

/**
 * Checks an uploaded file against a size limit and an accept list before it is stored or sent on.
 *
 * Use when: a server receives a file, or a browser is about to send one, and must refuse it with
 * a reason the user can act on. The accept list works like the HTML `accept` attribute, so the
 * same list can guard the input and the server. Checks run in order: not empty, not over
 * `maxBytes`, then an accepted type. Sizes in messages use 1024-byte units.
 *
 * @example
 * ```ts
 * const avatar = { maxBytes: 2 * 1024 * 1024, accept: ['image/*', '.heic'] }
 *
 * guardUpload({ name: 'me.png', size: 48_000, type: 'image/png' }, avatar)
 * // => Ok({ name: 'me.png', size: 48_000, type: 'image/png' })
 *
 * guardUpload({ name: 'IMG_0042.HEIC', size: 900_000, type: '' }, avatar)
 * // => Ok({ name: 'IMG_0042.HEIC', size: 900_000, type: '' })
 *
 * guardUpload({ name: 'cv.pdf', size: 80_000, type: 'application/pdf' }, avatar)
 * // => Err({ code: 'TYPE_NOT_ALLOWED', input: 'cv.pdf', message: '"cv.pdf" isn\'t an accepted type (image/*, .heic)' })
 *
 * R.pipe({ name: 'raw.png', size: 5 * 1024 * 1024, type: 'image/png' }, guardUpload(avatar))
 * // => Err({ code: 'TOO_LARGE', input: 'raw.png', message: '"raw.png" is 5.0 MB, the limit is 2.0 MB' })
 * ```
 *
 * @tags upload, file, size limit, mime, accept, content type, attachment, guard, image
 * @see guard - @ontologyio/receta/function, the checks in order with the first failure
 * @see toBytes - @ontologyio/receta/number, the sizes in the messages
 */
export function guardUpload<F extends GuardUploadFile>(
  file: F,
  options: GuardUploadOptions,
): Result<F, GuardUploadError>
export function guardUpload<F extends GuardUploadFile>(
  options: GuardUploadOptions,
): (file: F) => Result<F, GuardUploadError>
export function guardUpload(...args: unknown[]): unknown {
  return R.purry(guardUploadImplementation, args)
}

const guardUploadImplementation = <F extends GuardUploadFile>(
  file: F,
  options: GuardUploadOptions,
): Result<F, GuardUploadError> => {
  const refuse = (code: GuardUploadError['code'], message: string): GuardUploadError => ({
    code,
    input: file.name,
    message,
  })
  const formatSize = toBytes({ decimals: 1 })
  return guard<F, GuardUploadError>(
    [
      [where<GuardUploadFile>({ size: gt(0) }), refuse('EMPTY', `"${file.name}" is empty`)],
      [
        where<GuardUploadFile>({ size: lte(options.maxBytes) }),
        refuse('TOO_LARGE', `"${file.name}" is ${formatSize(file.size)}, the limit is ${formatSize(options.maxBytes)}`),
      ],
      [
        (upload) => R.isEmpty(options.accept) || options.accept.some(matchesAccept(upload)),
        refuse('TYPE_NOT_ALLOWED', `"${file.name}" isn't an accepted type (${R.join(options.accept, ', ')})`),
      ],
    ],
    file,
  )
}
