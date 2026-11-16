import * as R from 'remeda'
import { oneOf } from '@ontologyio/receta/predicate'
import { capitalize, kebabCase } from '@ontologyio/receta/string'

const ACRONYMS = [
  'api', 'csv', 'css', 'dob', 'faq', 'html', 'http', 'https', 'iban', 'id', 'ip', 'json', 'pdf',
  'sku', 'sms', 'sql', 'ui', 'uri', 'url', 'uuid', 'vat', 'xml',
] as const
const isAcronym = oneOf<string>(ACRONYMS)

/**
 * Turns a code name such as `firstName`, `created_at` or `apiUrl` into a label: `API URL`.
 *
 * Use when: generating form labels, table headers or validation messages from object keys
 * or database columns. camelCase, PascalCase, snake_case and kebab-case all work. Only the
 * first word is capitalized, the way most UIs write labels, and common acronyms such as
 * `id`, `url`, `api` and `vat` are uppercased wherever they appear.
 *
 * @example
 * ```ts
 * fieldLabel('firstName')
 * // => 'First name'
 *
 * fieldLabel('created_at')
 * // => 'Created at'
 *
 * fieldLabel('customerVatId')
 * // => 'Customer VAT ID'
 *
 * fieldLabel('APIUrl')
 * // => 'API URL'
 * ```
 *
 * @tags label, humanize, field, column, header, form, camelCase, snake_case, title
 * @see kebabCase - @ontologyio/receta/string, splits the name into words
 * @see capitalize - @ontologyio/receta/string, capitalizes the first word
 */
export function fieldLabel(key: string): string {
  return R.pipe(
    kebabCase(key),
    R.split('-'),
    R.map((word) => (isAcronym(word) ? word.toUpperCase() : word)),
    R.join(' '),
    capitalize,
  )
}
