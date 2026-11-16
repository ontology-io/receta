import * as R from 'remeda'
import { byString, compose, natural } from '@ontologyio/receta/compare'

/**
 * Sorts text the way people expect: numbers by value, so 'file2' comes before 'file10', and case ignored.
 *
 * Use when: listing file names, invoice numbers, chapter titles or hostnames where embedded
 * numbers should count as numbers. Case and accents are ignored for the order, and when two
 * texts differ only by case, a fixed tie-break by code unit puts uppercase first, so the result
 * is the same on every run.
 *
 * @example
 * ```ts
 * sortNatural(['file10.txt', 'file2.txt', 'File2.txt', 'file1.txt'], R.identity())
 * // => ['file1.txt', 'File2.txt', 'file2.txt', 'file10.txt']
 *
 * const chapters = [{ title: 'Part 12' }, { title: 'part 3' }, { title: 'Part 1' }]
 * R.pipe(chapters, sortNatural((chapter) => chapter.title), R.map(R.prop('title')))
 * // => ['Part 1', 'part 3', 'Part 12']
 * ```
 *
 * @tags sort, natural, alphanumeric, human, numbers in text, filenames, case insensitive, version
 * @see sortByLocale - text order for one language, such as Swedish or German
 * @see natural - @ontologyio/receta/compare, the number-aware comparison
 */
export function sortNatural<T>(items: readonly T[], text: (item: T) => string): readonly T[]
export function sortNatural<T>(text: (item: T) => string): (items: readonly T[]) => readonly T[]
export function sortNatural(...args: unknown[]): unknown {
  return R.purry(sortNaturalImplementation, args)
}

const sortNaturalImplementation = <T>(items: readonly T[], text: (item: T) => string): readonly T[] =>
  // natural treats 'File2' and 'file2' as equal, so byString decides between them.
  R.sort(items, compose(natural(text), byString(text)))
