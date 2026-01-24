import { some, none, type Option } from '../../option'

/**
 * Checks if a string is empty or contains only whitespace.
 *
 * @param str - The string to check
 * @returns True if the string is empty or whitespace-only
 *
 * @example
 * ```typescript
 * isEmpty('')
 * // => true
 *
 * isEmpty('   ')
 * // => true
 *
 * isEmpty('hello')
 * // => false
 *
 * isEmpty('  hello  ')
 * // => false
 * ```
 *
 * @see isBlank - alias for isEmpty
 */
export function isEmpty(str: string): boolean {
  return str.trim().length === 0
}

/**
 * Checks if a string is blank (empty or whitespace-only).
 *
 * Alias for isEmpty.
 *
 * @param str - The string to check
 * @returns True if the string is blank
 *
 * @see isEmpty - the base function
 */
export function isBlank(str: string): boolean {
  return isEmpty(str)
}

/**
 * Validates if a string is a valid email address.
 *
 * Returns Some with the email if valid, None otherwise.
 * Uses a practical regex that covers most common email formats.
 *
 * @param str - The string to validate
 * @returns Option containing the email if valid
 *
 * @example
 * ```typescript
 * isEmail('user@example.com')
 * // => Some('user@example.com')
 *
 * isEmail('invalid.email')
 * // => None
 *
 * isEmail('user+tag@domain.co.uk')
 * // => Some('user+tag@domain.co.uk')
 *
 * // Use in forms
 * const email = pipe(
 *   formData.email,
 *   isEmail,
 *   unwrapOr('Invalid email')
 * )
 * ```
 *
 * @see isUrl - for URL validation
 */
export function isEmail(str: string): Option<string> {
  // Practical email regex - covers most common cases
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (isEmpty(str)) {
    return none()
  }

  return emailRegex.test(str) ? some(str) : none()
}

/**
 * Validates if a string is a valid URL.
 *
 * Returns Some with the URL if valid, None otherwise.
 * Supports http, https, and protocol-relative URLs.
 *
 * @param str - The string to validate
 * @returns Option containing the URL if valid
 *
 * @example
 * ```typescript
 * isUrl('https://example.com')
 * // => Some('https://example.com')
 *
 * isUrl('not a url')
 * // => None
 *
 * isUrl('http://localhost:3000/path')
 * // => Some('http://localhost:3000/path')
 *
 * // Use in validation
 * const website = pipe(
 *   formData.website,
 *   isUrl,
 *   match({
 *     onSome: (url) => url,
 *     onNone: () => 'Invalid URL'
 *   })
 * )
 * ```
 *
 * @see isEmail - for email validation
 */
export function isUrl(str: string): Option<string> {
  if (isEmpty(str)) {
    return none()
  }

  try {
    new URL(str)
    return some(str)
  } catch {
    return none()
  }
}

/**
 * Validates if a string contains only alphanumeric characters.
 *
 * @param str - The string to check
 * @returns True if the string contains only letters and numbers
 *
 * @example
 * ```typescript
 * isAlphanumeric('hello123')
 * // => true
 *
 * isAlphanumeric('hello-world')
 * // => false
 *
 * isAlphanumeric('123')
 * // => true
 * ```
 */
export function isAlphanumeric(str: string): boolean {
  return /^[a-zA-Z0-9]+$/.test(str)
}

/**
 * Validates if a string contains only numeric characters.
 *
 * @param str - The string to check
 * @returns True if the string contains only digits
 *
 * @example
 * ```typescript
 * isNumeric('12345')
 * // => true
 *
 * isNumeric('123.45')
 * // => false
 *
 * isNumeric('12a34')
 * // => false
 * ```
 */
export function isNumeric(str: string): boolean {
  return /^\d+$/.test(str)
}

/**
 * Validates if a string is a valid hexadecimal color.
 *
 * Supports 3, 6, and 8 character hex colors with optional # prefix.
 *
 * @param str - The string to validate
 * @returns Option containing the hex color if valid
 *
 * @example
 * ```typescript
 * isHexColor('#ff0000')
 * // => Some('#ff0000')
 *
 * isHexColor('fff')
 * // => Some('fff')
 *
 * isHexColor('#ff00ff80')
 * // => Some('#ff00ff80') (with alpha)
 *
 * isHexColor('not-a-color')
 * // => None
 * ```
 */
export function isHexColor(str: string): Option<string> {
  const hexRegex = /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/
  return hexRegex.test(str) ? some(str) : none()
}
