/**
 * String module types
 *
 * @module string/types
 */

/**
 * Options for truncating a string.
 */
export interface TruncateOptions {
  /**
   * The maximum length of the string (including ellipsis).
   */
  readonly length: number

  /**
   * The string to append when truncated.
   *
   * @default '...'
   */
  readonly ellipsis?: string

  /**
   * If true, truncate at word boundary to avoid cutting words.
   *
   * @default false
   */
  readonly words?: boolean
}

/**
 * Options for case conversion functions.
 */
export interface CaseOptions {
  /**
   * Locale to use for case conversion.
   *
   * @default undefined (uses default locale)
   */
  readonly locale?: string | string[]
}

/**
 * Options for splitting text into words.
 */
export interface WordsOptions {
  /**
   * Pattern to match word boundaries.
   *
   * @default /[^a-zA-Z0-9]+/
   */
  readonly pattern?: RegExp
}

/**
 * Options for HTML escaping.
 */
export interface EscapeHtmlOptions {
  /**
   * If true, also escape single quotes.
   *
   * @default false
   */
  readonly escapeSingleQuote?: boolean
}

/**
 * Template interpolation error types.
 */
export type TemplateError =
  | { readonly type: 'missing_variable'; readonly variable: string }
  | { readonly type: 'invalid_template'; readonly message: string }

/**
 * Variable map for template interpolation.
 */
export type TemplateVars = Record<string, string | number | boolean | null | undefined>
