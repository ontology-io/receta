import * as R from 'remeda'
import { and, by, endsWith, not, oneOf, or, type Predicate } from '@ontologyio/receta/predicate'

/**
 * Builds a predicate for file names or paths that end in one of the given extensions, ignoring case.
 *
 * Use when: picking images out of an upload, source files out of a directory listing, or
 * keys out of an object-storage listing. Extensions may be written with or without the dot,
 * and may have several parts, such as `tar.gz`. A name must have something before the dot,
 * so `.png` alone, a hidden file, isn't a PNG.
 *
 * @example
 * ```ts
 * import { by } from '@ontologyio/receta/predicate'
 *
 * const files = ['cover.JPG', 'notes.md', 'photo.jpeg', 'backup.tar.gz', '.png']
 *
 * R.filter(files, hasExtension(['jpg', '.jpeg', 'png']))
 * // => ['cover.JPG', 'photo.jpeg']
 *
 * R.filter(files, hasExtension(['tar.gz']))
 * // => ['backup.tar.gz']
 *
 * R.filter([{ key: 'a/b.csv' }, { key: 'a/c.json' }], by((object) => object.key, hasExtension(['csv'])))
 * // => [{ key: 'a/b.csv' }]
 * ```
 *
 * @tags file, extension, suffix, type, image, path, upload, s3, filter
 * @see endsWith - @ontologyio/receta/predicate, one suffix, matching case
 */
export function hasExtension(extensions: readonly string[]): Predicate<string> {
  const suffixes = R.map(extensions, (extension) => `.${extension.replace(/^\./, '').toLowerCase()}`)
  // The file's own name, after the last slash, must hold more than the extension.
  const baseName = (path: string): string => (R.last(path.split(/[\\/]/)) ?? '').toLowerCase()
  return by(baseName, and(or(...R.map(suffixes, endsWith)), not(oneOf(suffixes))))
}
