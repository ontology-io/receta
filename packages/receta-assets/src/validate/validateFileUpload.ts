import * as R from 'remeda'
import { toBytes } from '@ontologyio/receta/number'
import { by, endsWith, eq, gt, lte, or, startsWith } from '@ontologyio/receta/predicate'
import { fromPredicate, validate, type Validation } from '@ontologyio/receta/validation'

/** The parts of a browser `File`, or of a multipart upload, that this checks. */
export type ValidateFileUploadFile = {
  readonly name: string
  /** Size in bytes. */
  readonly size: number
  /** MIME type, such as `image/png`. Empty when the browser couldn't tell. */
  readonly type: string
}

export type ValidateFileUploadPolicy = {
  /** Largest size allowed, in bytes. */
  readonly maxBytes: number
  /** MIME types allowed. `image/*` allows every image type. */
  readonly types: readonly string[]
}

/** `image/*` matches any `image/` type; anything else must match exactly, ignoring case. */
const typeMatcher = (allowed: string) =>
  R.pipe(allowed.toLowerCase(), (pattern) => (endsWith('/*')(pattern) ? startsWith(pattern.slice(0, -1)) : eq(pattern)))

/**
 * Checks an uploaded file's size and type against a policy, with messages that name the file.
 *
 * Use when: a form or API accepts an avatar, attachment or import file, and an empty file,
 * a 40 MB photo or an `.exe` should be refused before it is stored or processed. It reads
 * `name`, `size` and `type`, so a browser `File` works as it is. It trusts the declared MIME
 * type: check the file's bytes too when the upload is untrusted. Sizes in messages read like
 * "11.8 MB". The file comes back unchanged.
 *
 * @example
 * ```ts
 * const avatars = { maxBytes: 5 * 1024 * 1024, types: ['image/*'] }
 *
 * validateFileUpload({ name: 'me.png', size: 204800, type: 'image/png' }, avatars)
 * // => Valid({ name: 'me.png', size: 204800, type: 'image/png' })
 *
 * validateFileUpload({ name: 'tool.exe', size: 12400000, type: 'application/x-msdownload' }, avatars)
 * // => Invalid([
 * //   '"tool.exe" is 11.8 MB, over the 5.0 MB limit',
 * //   '"tool.exe" is not an accepted type. Accepted: image/*',
 * // ])
 *
 * R.pipe({ name: 'empty.jpg', size: 0, type: 'image/jpeg' }, validateFileUpload(avatars))
 * // => Invalid(['"empty.jpg" is empty'])
 * ```
 *
 * @tags file, upload, attachment, avatar, image, size, mime, type, limit, multipart
 * @see toBytes - @ontologyio/receta/number, formats the sizes in messages
 * @see validateFileUploads - several files at once, with a count and total size limit
 */
export function validateFileUpload(
  file: ValidateFileUploadFile,
  policy: ValidateFileUploadPolicy,
): Validation<ValidateFileUploadFile, string>
export function validateFileUpload(
  policy: ValidateFileUploadPolicy,
): (file: ValidateFileUploadFile) => Validation<ValidateFileUploadFile, string>
export function validateFileUpload(...args: unknown[]): unknown {
  return R.purry(validateFileUploadImplementation, args)
}

const validateFileUploadImplementation = (
  file: ValidateFileUploadFile,
  policy: ValidateFileUploadPolicy,
): Validation<ValidateFileUploadFile, string> => {
  const size = (bytes: number): string => toBytes(bytes, { decimals: 1 })
  const accepted = or(...R.map(policy.types, typeMatcher))
  return validate(file, [
    fromPredicate(by((upload: ValidateFileUploadFile) => upload.size, gt(0)), `"${file.name}" is empty`),
    fromPredicate(
      by((upload: ValidateFileUploadFile) => upload.size, lte(policy.maxBytes)),
      `"${file.name}" is ${size(file.size)}, over the ${size(policy.maxBytes)} limit`,
    ),
    fromPredicate(
      by((upload: ValidateFileUploadFile) => upload.type.toLowerCase(), accepted),
      `"${file.name}" is not an accepted type. Accepted: ${R.join(policy.types, ', ')}`,
    ),
  ])
}
