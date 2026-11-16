import * as R from 'remeda'
import { sum, toBytes } from '@ontologyio/receta/number'
import { by, endsWith, eq, gt, lte, or, startsWith } from '@ontologyio/receta/predicate'
import { collectErrors, fromPredicate, map, validate, type Validation } from '@ontologyio/receta/validation'

/** The parts of a browser `File`, or of a multipart upload, that this checks. */
export type ValidateFileUploadsFile = {
  readonly name: string
  /** Size in bytes. */
  readonly size: number
  /** MIME type, such as `image/png`. Empty when the browser couldn't tell. */
  readonly type: string
}

export type ValidateFileUploadsPolicy = {
  /** Largest size of one file, in bytes. */
  readonly maxBytes: number
  /** Largest size of all the files together, in bytes. */
  readonly maxTotalBytes: number
  /** Most files in one upload. */
  readonly maxFiles: number
  /** MIME types allowed. `image/*` allows every image type. */
  readonly types: readonly string[]
}

/** `image/*` matches any `image/` type; anything else must match exactly, ignoring case. */
const typeMatcher = (allowed: string) =>
  R.pipe(allowed.toLowerCase(), (pattern) => (endsWith('/*')(pattern) ? startsWith(pattern.slice(0, -1)) : eq(pattern)))

const size = (bytes: number): string => toBytes(bytes, { decimals: 1 })

const fileRules = (policy: ValidateFileUploadsPolicy) => (file: ValidateFileUploadsFile) =>
  validate(file, [
    fromPredicate(by((upload: ValidateFileUploadsFile) => upload.size, gt(0)), `"${file.name}" is empty`),
    fromPredicate(
      by((upload: ValidateFileUploadsFile) => upload.size, lte(policy.maxBytes)),
      `"${file.name}" is ${size(file.size)}, over the ${size(policy.maxBytes)} limit`,
    ),
    fromPredicate(
      by((upload: ValidateFileUploadsFile) => upload.type.toLowerCase(), or(...R.map(policy.types, typeMatcher))),
      `"${file.name}" is not an accepted type. Accepted: ${R.join(policy.types, ', ')}`,
    ),
  ])

/**
 * Checks a multi-file upload: each file's size and type, how many there are, and their total size.
 *
 * Use when: an attachment picker, gallery or bulk import takes several files, and the person
 * should see every refused file and every broken limit in one message list. Each file gets
 * the same checks as `validateFileUpload`, named by file; the count and total size are
 * checked on the whole list. The files come back unchanged and in order.
 *
 * @example
 * ```ts
 * const policy = { maxBytes: 2_000_000, maxTotalBytes: 3_000_000, maxFiles: 2, types: ['image/png', 'application/pdf'] }
 *
 * validateFileUploads([{ name: 'a.png', size: 1_000_000, type: 'image/png' }], policy)
 * // => Valid([{ name: 'a.png', size: 1000000, type: 'image/png' }])
 *
 * validateFileUploads(
 *   [
 *     { name: 'a.pdf', size: 1_500_000, type: 'application/pdf' },
 *     { name: 'b.gif', size: 1_900_000, type: 'image/gif' },
 *     { name: 'c.png', size: 100, type: 'image/png' },
 *   ],
 *   policy,
 * )
 * // => Invalid([
 * //   '"b.gif" is not an accepted type. Accepted: image/png, application/pdf',
 * //   'Choose at most 2 files',
 * //   'The files add up to 3.2 MB, over the 2.9 MB limit',
 * // ])
 * ```
 *
 * @tags files, upload, attachments, multiple, bulk, gallery, size, mime, limit
 * @see validateFileUpload - one file
 * @see collectErrors - @ontologyio/receta/validation, keeps every file's messages
 */
export function validateFileUploads(
  files: readonly ValidateFileUploadsFile[],
  policy: ValidateFileUploadsPolicy,
): Validation<readonly ValidateFileUploadsFile[], string>
export function validateFileUploads(
  policy: ValidateFileUploadsPolicy,
): (files: readonly ValidateFileUploadsFile[]) => Validation<readonly ValidateFileUploadsFile[], string>
export function validateFileUploads(...args: unknown[]): unknown {
  return R.purry(validateFileUploadsImplementation, args)
}

const validateFileUploadsImplementation = (
  files: readonly ValidateFileUploadsFile[],
  policy: ValidateFileUploadsPolicy,
): Validation<readonly ValidateFileUploadsFile[], string> => {
  const total = sum(R.map(files, R.prop('size')))
  const wholeUpload = validate(files, [
    fromPredicate(by((list: readonly ValidateFileUploadsFile[]) => list.length, lte(policy.maxFiles)), `Choose at most ${policy.maxFiles} files`),
    fromPredicate(
      by((list: readonly ValidateFileUploadsFile[]) => sum(R.map(list, R.prop('size'))), lte(policy.maxTotalBytes)),
      `The files add up to ${size(total)}, over the ${size(policy.maxTotalBytes)} limit`,
    ),
  ])
  return R.pipe(
    // The checks hold different values, a file or the list; only their errors matter here.
    collectErrors<unknown, string>([...R.map(files, fileRules(policy)), wholeUpload]),
    map(() => files),
  )
}
