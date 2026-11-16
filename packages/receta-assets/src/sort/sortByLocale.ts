import * as R from 'remeda'
import { byString, compose, localeCompare } from '@ontologyio/receta/compare'

/**
 * Sorts text in the alphabetical order of one language, such as Swedish, German or Spanish.
 *
 * Use when: showing names, cities or product titles to users of a given locale, where code-unit
 * order is wrong: Swedish puts 'Ä' after 'Z', German files it with 'A', and Spanish puts 'ñ'
 * after 'n'. Case doesn't change the order; when two texts differ only by case, the locale's
 * own tie-break decides, so the result is the same every time. `locale` is a BCP 47 tag like
 * 'sv' or 'de-DE'.
 *
 * @example
 * ```ts
 * const cities = ['Zürich', 'Ängelholm', 'aarhus', 'Oslo']
 *
 * sortByLocale(cities, R.identity(), 'sv')
 * // => ['aarhus', 'Oslo', 'Zürich', 'Ängelholm']
 *
 * R.pipe(cities, sortByLocale(R.identity(), 'de'))
 * // => ['aarhus', 'Ängelholm', 'Oslo', 'Zürich']
 * ```
 *
 * @tags sort, locale, language, alphabetical, i18n, collation, accents, umlaut, international
 * @see sortNatural - numbers inside text compared by value, in no particular language
 * @see localeCompare - @ontologyio/receta/compare, the language-aware comparison
 */
export function sortByLocale<T>(items: readonly T[], text: (item: T) => string, locale: string): readonly T[]
export function sortByLocale<T>(text: (item: T) => string, locale: string): (items: readonly T[]) => readonly T[]
export function sortByLocale(...args: unknown[]): unknown {
  return R.purry(sortByLocaleImplementation, args)
}

const sortByLocaleImplementation = <T>(items: readonly T[], text: (item: T) => string, locale: string): readonly T[] =>
  R.sort(
    items,
    // The first comparison ignores case; the second settles texts that differ only by case.
    compose(byString(text, { locale, caseSensitive: false }), localeCompare(text, locale)),
  )
