import type { Comparator, ComparableExtractor } from '../types'

/**
 * Creates a case-insensitive string comparator.
 *
 * Convenience wrapper for `byString` with `caseSensitive: false`.
 *
 * @param fn - Function to extract the string value
 * @returns A case-insensitive comparator
 *
 * @example
 * ```typescript
 * interface File {
 *   name: string
 *   extension: string
 * }
 *
 * const files = [
 *   { name: 'README.md', extension: 'md' },
 *   { name: 'index.ts', extension: 'ts' },
 *   { name: 'App.tsx', extension: 'tsx' },
 *   { name: 'package.json', extension: 'json' }
 * ]
 *
 * // Case-sensitive (default) - uppercase comes first
 * files.sort(byString(f => f.name))
 * // => [App.tsx, README.md, index.ts, package.json]
 *
 * // Case-insensitive - alphabetical regardless of case
 * files.sort(caseInsensitive(f => f.name))
 * // => [App.tsx, index.ts, package.json, README.md]
 * ```
 *
 * @see byString - for more string comparison options
 * @see natural - for natural string sorting (handles numbers)
 */
export function caseInsensitive<T>(fn: ComparableExtractor<T, string>): Comparator<T> {
  return (a, b) => {
    const aStr = fn(a).toLowerCase()
    const bStr = fn(b).toLowerCase()

    return aStr < bStr ? -1 : aStr > bStr ? 1 : 0
  }
}

/**
 * Creates a locale-aware string comparator.
 *
 * Uses the browser/Node.js locale system for culturally appropriate sorting.
 * Handles accented characters, special characters, and language-specific rules.
 *
 * @param fn - Function to extract the string value
 * @param locale - BCP 47 language tag (e.g., 'en-US', 'de-DE', 'fr-FR')
 * @returns A locale-aware comparator
 *
 * @example
 * ```typescript
 * interface City {
 *   name: string
 *   country: string
 * }
 *
 * const cities = [
 *   { name: 'Zürich', country: 'Switzerland' },
 *   { name: 'Berlin', country: 'Germany' },
 *   { name: 'München', country: 'Germany' },
 *   { name: 'Åarhus', country: 'Denmark' }
 * ]
 *
 * // German locale (handles umlauts correctly)
 * cities.sort(localeCompare(c => c.name, 'de-DE'))
 * // => [Åarhus, Berlin, München, Zürich]
 *
 * // French locale
 * const names = [
 *   { name: 'Étienne' },
 *   { name: 'Eric' },
 *   { name: 'Émile' }
 * ]
 * names.sort(localeCompare(n => n.name, 'fr-FR'))
 * // => [Émile, Eric, Étienne]
 *
 * // English locale
 * const words = [
 *   { word: 'résumé' },
 *   { word: 'resume' },
 *   { word: 'result' }
 * ]
 * words.sort(localeCompare(w => w.word, 'en-US'))
 * ```
 *
 * @see byString - for more string comparison options
 * @see caseInsensitive - for simple case-insensitive sorting
 */
export function localeCompare<T>(
  fn: ComparableExtractor<T, string>,
  locale: string
): Comparator<T> {
  return (a, b) => {
    const aStr = fn(a)
    const bStr = fn(b)

    return aStr.localeCompare(bStr, locale)
  }
}
