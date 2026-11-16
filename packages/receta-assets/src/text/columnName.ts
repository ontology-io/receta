import * as R from 'remeda'
import { kebabCase, slugify, truncate } from '@ontologyio/receta/string'

// PostgreSQL cuts identifiers at 63 bytes; the others allow at least as many.
const MAX_LENGTH = 63

/**
 * Turns a spreadsheet header or label into a SQL column name: `Order Total ($)` → `order_total`.
 *
 * Use when: importing a CSV or spreadsheet into a database table and the headers become
 * column names. Accents are dropped, symbols separate words, and camelCase splits at its
 * capitals. A name starting with a digit gets `_` in front, since SQL needs quotes for it,
 * and names are cut to 63 characters, PostgreSQL's limit. A header with no letters or
 * digits gives `''`, so check for duplicates and blanks across all headers.
 *
 * @example
 * ```ts
 * columnName('Order Total ($)')
 * // => 'order_total'
 *
 * columnName('customerEmail')
 * // => 'customer_email'
 *
 * columnName('2024 Revenue')
 * // => '_2024_revenue'
 *
 * columnName('Société')
 * // => 'societe'
 * ```
 *
 * @tags column, sql, database, snake_case, csv, import, header, identifier, postgres
 * @see kebabCase - @ontologyio/receta/string, splits camelCase into words
 * @see slugify - @ontologyio/receta/string, drops accents and symbols
 * @see envVarName - the same cleanup in SCREAMING_SNAKE_CASE
 * @see propertyName - the same cleanup as a camelCase property
 */
export function columnName(header: string): string {
  return R.pipe(
    kebabCase(header),
    slugify,
    (slug) => slug.replaceAll('-', '_'),
    (name) => (/^\d/.test(name) ? `_${name}` : name),
    (name) => truncate(name, { length: MAX_LENGTH, ellipsis: '' }),
  )
}
