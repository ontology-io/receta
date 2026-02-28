import type { CaseOptions } from '../types'

/**
 * Converts a string to kebab-case.
 *
 * @param str - The string to convert
 * @returns The string in kebab-case
 *
 * @example
 * ```typescript
 * kebabCase('helloWorld')
 * // => 'hello-world'
 *
 * kebabCase('UserProfilePage')
 * // => 'user-profile-page'
 *
 * kebabCase('API_KEY_VALUE')
 * // => 'api-key-value'
 * ```
 *
 * @see slugify - for URL-safe slugs with additional normalization
 * @see snakeCase - for snake_case conversion
 */
export function kebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2') // camelCase boundaries
    .replace(/[\s_]+/g, '-') // spaces and underscores to hyphens
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2') // UPPERCASE sequences
    .toLowerCase()
    .replace(/-+/g, '-') // collapse consecutive hyphens
    .replace(/^-+|-+$/g, '') // trim hyphens
}

/**
 * Converts a string to snake_case.
 *
 * @param str - The string to convert
 * @returns The string in snake_case
 *
 * @example
 * ```typescript
 * snakeCase('helloWorld')
 * // => 'hello_world'
 *
 * snakeCase('UserProfilePage')
 * // => 'user_profile_page'
 *
 * snakeCase('API-KEY-VALUE')
 * // => 'api_key_value'
 * ```
 *
 * @see kebabCase - for kebab-case conversion
 * @see camelCase - for camelCase conversion
 */
export function snakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2') // camelCase boundaries
    .replace(/[\s-]+/g, '_') // spaces and hyphens to underscores
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2') // UPPERCASE sequences
    .toLowerCase()
    .replace(/_+/g, '_') // collapse consecutive underscores
    .replace(/^_+|_+$/g, '') // trim underscores
}

/**
 * Converts a string to camelCase.
 *
 * @param str - The string to convert
 * @returns The string in camelCase
 *
 * @example
 * ```typescript
 * camelCase('hello-world')
 * // => 'helloWorld'
 *
 * camelCase('user_profile_page')
 * // => 'userProfilePage'
 *
 * camelCase('API KEY VALUE')
 * // => 'apiKeyValue'
 * ```
 *
 * @see pascalCase - for PascalCase conversion
 * @see snakeCase - for snake_case conversion
 */
export function camelCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''))
    .replace(/^[A-Z]/, (char) => char.toLowerCase())
}

/**
 * Converts a string to PascalCase.
 *
 * @param str - The string to convert
 * @returns The string in PascalCase
 *
 * @example
 * ```typescript
 * pascalCase('hello-world')
 * // => 'HelloWorld'
 *
 * pascalCase('user_profile_page')
 * // => 'UserProfilePage'
 *
 * pascalCase('api key value')
 * // => 'ApiKeyValue'
 * ```
 *
 * @see camelCase - for camelCase conversion
 * @see kebabCase - for kebab-case conversion
 */
export function pascalCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''))
    .replace(/^[a-z]/, (char) => char.toUpperCase())
}

/**
 * Capitalizes the first character of a string.
 *
 * @param str - The string to capitalize
 * @param options - Case conversion options
 * @returns The string with first character capitalized
 *
 * @example
 * ```typescript
 * capitalize('hello world')
 * // => 'Hello world'
 *
 * capitalize('HELLO')
 * // => 'HELLO' (only capitalizes first char, doesn't lowercase rest)
 *
 * capitalize('')
 * // => ''
 * ```
 *
 * @see titleCase - to capitalize all words
 */
export function capitalize(str: string, options?: CaseOptions): string {
  if (str.length === 0) return str
  const locale = options?.locale
  return str.charAt(0).toLocaleUpperCase(locale) + str.slice(1)
}

/**
 * Converts a string to Title Case.
 *
 * Capitalizes the first letter of each word. Words are separated by spaces.
 *
 * @param str - The string to convert
 * @param options - Case conversion options
 * @returns The string in Title Case
 *
 * @example
 * ```typescript
 * titleCase('hello world')
 * // => 'Hello World'
 *
 * titleCase('the quick brown fox')
 * // => 'The Quick Brown Fox'
 *
 * titleCase('user-profile-page')
 * // => 'User-profile-page' (only capitalizes after spaces)
 * ```
 *
 * @see capitalize - to capitalize only the first character
 */
export function titleCase(str: string, options?: CaseOptions): string {
  const locale = options?.locale
  return str.replace(/\b[a-z]/g, (char) => char.toLocaleUpperCase(locale))
}
