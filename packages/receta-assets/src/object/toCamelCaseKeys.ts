import * as R from 'remeda'
import { transformKeys, type PlainObject } from '@ontologyio/receta/object'
import { matches, or, startsWith } from '@ontologyio/receta/predicate'
import { camelCase } from '@ontologyio/receta/string'

// `_id`, `__typename` and `$ref` are names a database or protocol owns: renaming them breaks it.
const isReservedKey = or(startsWith('_'), startsWith('$'))
const hasSeparator = matches(/[-_\s]/)
const hasNoLowerCase = matches(/^[^a-z]*$/)

const toCamelKey = (key: string): string => {
  if (isReservedKey(key)) return key
  // Receta's camelCase lower-cases first, which would turn `firstName` into `firstname`.
  if (hasSeparator(key) || hasNoLowerCase(key)) return camelCase(key)
  return key.charAt(0).toLowerCase() + key.slice(1)
}

/**
 * Renames every key to camelCase at any depth, arrays included, for data that came from a snake_case API.
 *
 * Use when: an API, database row or webhook sends `snake_case` or `kebab-case` keys and the
 * app works in camelCase. Keys already in camelCase stay as they are, PascalCase becomes
 * camelCase, and all-caps names become lower-case (`ID` → `id`). Keys that start with `_` or
 * `$`, such as `_id`, `__typename` and `$ref`, are kept as they are. Values are untouched, and
 * class instances such as `Date` are not walked into.
 *
 * @example
 * ```ts
 * toCamelCaseKeys({ user_id: 7, first_name: 'Ada', 'x-request-id': 'r1', home_address: { zip_code: '10115' } })
 * // => { userId: 7, firstName: 'Ada', xRequestId: 'r1', homeAddress: { zipCode: '10115' } }
 *
 * toCamelCaseKeys({ _id: 'a1', createdAt: 'x', ID: 3, LineItems: [{ UNIT_PRICE: 5 }] })
 * // => { _id: 'a1', createdAt: 'x', id: 3, lineItems: [{ unitPrice: 5 }] }
 *
 * toCamelCaseKeys({})
 * // => {}
 * ```
 *
 * @tags camelCase, keys, api, response, rename, case, deserialize, snake_case, json
 * @see toSnakeCaseKeys - the way there, for the request payload
 * @see transformKeys - @ontologyio/receta/object, the deep key walk
 * @see camelCase - @ontologyio/receta/string, the rename for keys with separators
 */
export function toCamelCaseKeys(value: PlainObject): PlainObject {
  return R.pipe(value, transformKeys(toCamelKey))
}
