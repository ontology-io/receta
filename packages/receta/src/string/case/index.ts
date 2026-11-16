import * as R from 'remeda'
import type { CaseOptions } from '../types'

/**
 * Splits a string into the words the case converters join back together.
 *
 * A word ends at a separator (space, hyphen, underscore), where a lower-case letter meets a
 * capital (`firstName`), and before the last capital of a run of capitals (`XMLHttp`).
 */
function caseWords(str: string): string[] {
  return R.pipe(
    str
      .replace(/(\p{Ll})(\p{Lu})/gu, '$1 $2') // camelCase boundaries
      .replace(/(\p{Lu}+)(\p{Lu}\p{Ll})/gu, '$1 $2') // UPPERCASE sequences
      .split(/[\s_-]+/),
    R.filter(R.isTruthy)
  )
}

function capitalizeWord(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
}

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
  return caseWords(str).join('-').toLowerCase()
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
  return caseWords(str).join('_').toLowerCase()
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
 *
 * // A string that already has capitals keeps its word boundaries
 * camelCase('firstName')
 * // => 'firstName'
 *
 * camelCase('XMLHttpRequest')
 * // => 'xmlHttpRequest'
 * ```
 *
 * @see pascalCase - for PascalCase conversion
 * @see snakeCase - for snake_case conversion
 */
export function camelCase(str: string): string {
  const [first = '', ...rest] = caseWords(str)

  return first.toLowerCase() + R.map(rest, capitalizeWord).join('')
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
 *
 * // A string that already has capitals keeps its word boundaries
 * pascalCase('firstName')
 * // => 'FirstName'
 * ```
 *
 * @see camelCase - for camelCase conversion
 * @see kebabCase - for kebab-case conversion
 */
export function pascalCase(str: string): string {
  return R.map(caseWords(str), capitalizeWord).join('')
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
