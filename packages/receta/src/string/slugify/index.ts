/**
 * Converts a string to a URL-safe slug.
 *
 * Transforms the input by:
 * - Converting to lowercase
 * - Replacing spaces and special characters with hyphens
 * - Removing consecutive hyphens
 * - Trimming leading/trailing hyphens
 *
 * @param str - The string to slugify
 * @returns A URL-safe slug
 *
 * @example
 * ```typescript
 * slugify('Hello World!')
 * // => 'hello-world'
 *
 * slugify('  TypeScript & JavaScript  ')
 * // => 'typescript-javascript'
 *
 * slugify('10 Tips for Better Code')
 * // => '10-tips-for-better-code'
 *
 * slugify('Café Münster')
 * // => 'cafe-munster'
 * ```
 *
 * @see kebabCase - for converting to kebab-case without URL normalization
 */
export function slugify(str: string): string {
  return str
    .normalize('NFD') // Normalize Unicode
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s_-]/g, '') // Remove non-alphanumeric except spaces, underscores, and hyphens
    .replace(/[\s_]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/-+/g, '-') // Replace consecutive hyphens with single hyphen
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}
