import * as R from 'remeda'
import { camelCase, kebabCase, slugify } from '@ontologyio/receta/string'

/**
 * Turns a spreadsheet header or label into a camelCase property name: `First Name` → `firstName`.
 *
 * Use when: mapping CSV or form headers to the keys of a JavaScript object or a JSON
 * payload. Accents are dropped, symbols separate words, and existing camelCase keeps its
 * word breaks, so `userID` gives `userId`. A name starting with a digit gets `_` in front
 * so it stays a valid identifier. A header with no letters or digits gives `''`.
 *
 * @example
 * ```ts
 * propertyName('First Name')
 * // => 'firstName'
 *
 * propertyName('Order Total ($)')
 * // => 'orderTotal'
 *
 * propertyName('userID')
 * // => 'userId'
 *
 * propertyName('2nd address line')
 * // => '_2ndAddressLine'
 * ```
 *
 * @tags camelCase, property, key, identifier, csv, header, json, field name
 * @see camelCase - @ontologyio/receta/string, joins the words
 * @see slugify - @ontologyio/receta/string, drops accents and symbols
 * @see columnName - the same cleanup as a snake_case column
 * @see envVarName - the same cleanup in SCREAMING_SNAKE_CASE
 */
export function propertyName(header: string): string {
  return R.pipe(
    kebabCase(header),
    slugify,
    camelCase,
    (name) => (/^\d/.test(name) ? `_${name}` : name),
  )
}
