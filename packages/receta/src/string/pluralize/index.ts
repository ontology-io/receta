import * as R from 'remeda'

/**
 * Options for pluralize function.
 */
export interface PluralizeOptions {
  /**
   * Custom plural form. If not provided, applies standard English pluralization rules.
   */
  readonly plural?: string

  /**
   * If true, returns only the pluralized word without the count.
   *
   * @default false
   */
  readonly wordOnly?: boolean
}

/**
 * Pluralizes a word based on count, with smart English pluralization rules.
 *
 * By default, applies standard English pluralization:
 * - Words ending in 's', 'ss', 'sh', 'ch', 'x', 'z' → add 'es'
 * - Words ending in consonant + 'y' → replace 'y' with 'ies'
 * - Words ending in 'f' or 'fe' → replace with 'ves'
 * - All others → add 's'
 *
 * For irregular plurals, provide a custom plural form via options.
 *
 * @param word - The singular word to pluralize
 * @param count - The count to determine singular vs plural
 * @param options - Pluralization options
 * @returns The pluralized string with count (e.g., "5 items") or just the word if wordOnly is true
 *
 * @example
 * ```typescript
 * // Data-first
 * pluralize('item', 1)
 * // => '1 item'
 *
 * pluralize('item', 5)
 * // => '5 items'
 *
 * pluralize('box', 3)
 * // => '3 boxes'
 *
 * pluralize('story', 2)
 * // => '2 stories'
 *
 * pluralize('knife', 4)
 * // => '4 knives'
 *
 * // Custom plural
 * pluralize('person', 3, { plural: 'people' })
 * // => '3 people'
 *
 * // Word only
 * pluralize('category', 2, { wordOnly: true })
 * // => 'categories'
 *
 * // Data-last (in pipe)
 * pipe(
 *   users.length,
 *   (count) => pluralize('user', count)
 * )
 * // => '42 users'
 * ```
 *
 * @see toOrdinal - for ordinal numbers (1st, 2nd, 3rd)
 */
export function pluralize(word: string, count: number, options?: PluralizeOptions): string
export function pluralize(
  count: number,
  options?: PluralizeOptions
): (word: string) => string
export function pluralize(...args: any[]): unknown {
  // Handle data-first: pluralize(word, count, options?)
  if (args.length >= 2 && typeof args[0] === 'string') {
    return pluralizeImplementation(args[0], args[1], args[2])
  }

  // Handle data-last: pluralize(count, options?)(word)
  const count = args[0] as number
  const options = args[1] as PluralizeOptions | undefined
  return (word: string) => pluralizeImplementation(word, count, options)
}

function pluralizeImplementation(
  word: string,
  count: number,
  options: PluralizeOptions = {}
): string {
  const { plural, wordOnly = false } = options

  // Count of 1 is always singular
  if (count === 1) {
    return wordOnly ? word : `${count} ${word}`
  }

  let pluralWord: string

  if (plural !== undefined) {
    // Use custom plural form
    pluralWord = plural
  } else {
    // Apply standard English pluralization rules
    pluralWord = applyPluralRules(word)
  }

  return wordOnly ? pluralWord : `${count} ${pluralWord}`
}

/**
 * Applies standard English pluralization rules.
 */
function applyPluralRules(word: string): string {
  if (word.length === 0) {
    return word
  }

  const lower = word.toLowerCase()

  // Words ending in s, ss, sh, ch, x, z → add 'es'
  if (
    lower.endsWith('s') ||
    lower.endsWith('ss') ||
    lower.endsWith('sh') ||
    lower.endsWith('ch') ||
    lower.endsWith('x') ||
    lower.endsWith('z')
  ) {
    return word + 'es'
  }

  // Words ending in consonant + 'y' → replace 'y' with 'ies'
  if (lower.endsWith('y') && word.length > 1) {
    const beforeY = lower[lower.length - 2]
    if (beforeY && !/[aeiou]/.test(beforeY)) {
      return word.slice(0, -1) + 'ies'
    }
  }

  // Words ending in 'f' or 'fe' → replace with 'ves'
  if (lower.endsWith('f')) {
    return word.slice(0, -1) + 'ves'
  }
  if (lower.endsWith('fe')) {
    return word.slice(0, -2) + 'ves'
  }

  // Words ending in consonant + 'o' → add 'es'
  if (lower.endsWith('o') && word.length > 1) {
    const beforeO = lower[lower.length - 2]
    if (beforeO && !/[aeiou]/.test(beforeO)) {
      return word + 'es'
    }
  }

  // Default: add 's'
  return word + 's'
}
