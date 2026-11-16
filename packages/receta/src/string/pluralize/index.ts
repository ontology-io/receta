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
 * - Words ending in 's', 'ss', 'sh', 'ch', 'x', 'z' → add 'es' (`quiz` doubles its z, and
 *   `stomach`, `monarch` and `epoch` just add 's')
 * - Words ending in consonant + 'y' → replace 'y' with 'ies'
 * - The 'f' and 'fe' words that change (`knife`, `leaf`, `wolf`, `half`, `shelf`…) → 'ves'.
 *   The rest add 's': `chiefs`, `roofs`, `safes`
 * - The consonant + 'o' words that take it (`hero`, `potato`, `tomato`, `echo`…) → add 'es'.
 *   The rest add 's': `photos`, `pianos`, `memos`
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
 * pluralize('chief', 2)
 * // => '2 chiefs'
 *
 * pluralize('photo', 3)
 * // => '3 photos'
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

// English has no rule for these endings, only lists. Each list holds the words that change;
// a word that ends with one of them changes too (bookshelf, superhero).
const F_TO_VES = ['calf', 'elf', 'half', 'knife', 'leaf', 'life', 'loaf', 'self', 'sheaf', 'thief', 'wife', 'wolf']
const O_TO_OES = ['domino', 'echo', 'embargo', 'hero', 'mosquito', 'potato', 'tomato', 'tornado', 'torpedo', 'veto', 'volcano']
const Z_TO_ZZES = ['fez', 'quiz', 'whiz']
const HARD_CH = ['epoch', 'matriarch', 'monarch', 'patriarch', 'stomach']

const endsWithOneOf =
  (endings: readonly string[]) =>
  (word: string): boolean =>
    endings.some((ending) => word.endsWith(ending))

const SIBILANT_ENDINGS = ['s', 'sh', 'ch', 'x', 'z']

/**
 * Applies standard English pluralization rules.
 */
function applyPluralRules(word: string): string {
  if (word.length === 0) {
    return word
  }

  const lower = word.toLowerCase()

  if (endsWithOneOf(Z_TO_ZZES)(lower)) {
    return word + 'zes'
  }

  if (endsWithOneOf(HARD_CH)(lower)) {
    return word + 's'
  }

  // Words ending in s, ss, sh, ch, x, z → add 'es'
  if (endsWithOneOf(SIBILANT_ENDINGS)(lower)) {
    return word + 'es'
  }

  // Words ending in consonant + 'y' → replace 'y' with 'ies'
  if (/[^aeiou]y$/.test(lower)) {
    return word.slice(0, -1) + 'ies'
  }

  // knife → knives, leaf → leaves. Other f/fe words just add 's' (chiefs, safes)
  if (endsWithOneOf(F_TO_VES)(lower)) {
    return word.slice(0, lower.endsWith('fe') ? -2 : -1) + 'ves'
  }

  // hero → heroes. Other words ending in 'o' just add 's' (photos, radios)
  if (endsWithOneOf(O_TO_OES)(lower)) {
    return word + 'es'
  }

  // Default: add 's'
  return word + 's'
}
