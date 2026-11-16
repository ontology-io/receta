import * as R from 'remeda'
import { transformKeys, type PlainObject } from '@ontologyio/receta/object'
import { startsWith, or } from '@ontologyio/receta/predicate'
import { snakeCase } from '@ontologyio/receta/string'

// `_id`, `__typename` and `$ref` are names a database or protocol owns: renaming them breaks it.
const isReservedKey = or(startsWith('_'), startsWith('$'))

const toSnakeKey = (key: string): string => (isReservedKey(key) ? key : snakeCase(key))

/**
 * Renames every key to snake_case at any depth, arrays included, for a payload bound for a snake_case API.
 *
 * Use when: sending a camelCase object to a backend, database or third-party API that
 * expects `snake_case`, such as a Rails, Django or Postgres row. Acronyms stay one word
 * (`userID` → `user_id`, `HTTPStatus` → `http_status`). Keys that start with `_` or `$`, such
 * as `_id`, `__typename` and `$ref`, are kept as they are. Values are untouched, and class
 * instances such as `Date` are not walked into.
 *
 * @example
 * ```ts
 * toSnakeCaseKeys({ userID: 7, firstName: 'Ada', homeAddress: { zipCode: '10115' } })
 * // => { user_id: 7, first_name: 'Ada', home_address: { zip_code: '10115' } }
 *
 * toSnakeCaseKeys({ _id: 'a1', __typename: 'User', lineItems: [{ unitPrice: 5 }] })
 * // => { _id: 'a1', __typename: 'User', line_items: [{ unit_price: 5 }] }
 *
 * toSnakeCaseKeys({})
 * // => {}
 * ```
 *
 * @tags snake_case, keys, api, payload, rename, case, serialize, backend, rails, django
 * @see toCamelCaseKeys - the way back, for the API's response
 * @see transformKeys - @ontologyio/receta/object, the deep key walk
 * @see snakeCase - @ontologyio/receta/string, the per-key rename that keeps acronyms whole
 */
export function toSnakeCaseKeys(value: PlainObject): PlainObject {
  return R.pipe(value, transformKeys(toSnakeKey))
}
