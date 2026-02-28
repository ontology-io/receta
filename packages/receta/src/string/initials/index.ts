import * as R from 'remeda'

/**
 * Options for initials function.
 */
export interface InitialsOptions {
  /**
   * Maximum number of initials to return.
   * If not specified, returns all initials.
   *
   * @default undefined (return all)
   */
  readonly maxInitials?: number

  /**
   * If true, converts initials to uppercase.
   *
   * @default true
   */
  readonly uppercase?: boolean
}

/**
 * Extracts initials from a name or phrase.
 *
 * Splits the input by whitespace and takes the first character of each word.
 * Commonly used for user avatars, labels, and displays.
 *
 * @param name - The name or phrase to extract initials from
 * @param options - Initials options
 * @returns The extracted initials
 *
 * @example
 * ```typescript
 * // Data-first
 * initials('John Doe')
 * // => 'JD'
 *
 * initials('Mary Jane Watson')
 * // => 'MJW'
 *
 * initials('Mary Jane Watson', { maxInitials: 2 })
 * // => 'MJ'
 *
 * initials('john doe', { uppercase: false })
 * // => 'jd'
 *
 * initials('  Multiple   Spaces  ')
 * // => 'MS'
 *
 * initials('')
 * // => ''
 *
 * initials('Single')
 * // => 'S'
 *
 * // Data-last (in pipe)
 * pipe(
 *   user.fullName,
 *   initials({ maxInitials: 2 })
 * )
 * // => 'JD'
 *
 * // Common use case: Avatar labels
 * const avatarLabel = pipe(
 *   'Robert Downey Jr.',
 *   initials({ maxInitials: 2 })
 * ) // => 'RD'
 * ```
 *
 * @see capitalize - for capitalizing first letter
 * @see words - for extracting words from text
 */
export function initials(name: string, options?: InitialsOptions): string
export function initials(options?: InitialsOptions): (name: string) => string
export function initials(...args: any[]): unknown {
  // Handle data-first: initials(name, options?)
  if (typeof args[0] === 'string') {
    return initialsImplementation(args[0], args[1])
  }

  // Handle data-last: initials(options?)(name)
  const options = args[0] as InitialsOptions | undefined
  return (name: string) => initialsImplementation(name, options)
}

function initialsImplementation(name: string, options: InitialsOptions = {}): string {
  const { maxInitials, uppercase = true } = options

  // Split by whitespace and filter empty strings
  const words = name.trim().split(/\s+/).filter(Boolean)

  if (words.length === 0) {
    return ''
  }

  // Take first character of each word
  const result = R.pipe(
    words,
    R.map((word) => {
      const firstChar = word[0] ?? ''
      // Apply case transformation
      return uppercase ? firstChar.toUpperCase() : firstChar.toLowerCase()
    }),
    R.take(maxInitials ?? words.length),
    R.join('')
  )

  return result
}
