import * as R from 'remeda'
import { mapKeys, unflatten, type PlainObject } from '@ontologyio/receta/object'

/** `items[0][name]` and `items.0.name` both become `items.0.name`. */
const toDotPath = (name: string): string => name.replace(/\[([^\]]*)\]/g, '.$1').replace(/^\./, '')

/**
 * Turns flat form field names such as `address.city` or `items[0][name]` into one nested object.
 *
 * Use when: reading `FormData`, a urlencoded body or a query string whose field names carry
 * the structure, as HTML forms, PHP and Rails do. Dots and brackets both nest, and a numeric
 * part makes an array (`tags[1]` puts a value at index 1). Values stay as they came, usually
 * strings. A name such as `__proto__` becomes an ordinary key, so untrusted field names can't
 * reach a prototype. An empty bracket pair (`tags[]`) is not a list append: pass repeated
 * fields as an array under one key instead.
 *
 * @example
 * ```ts
 * unflattenFormFields({
 *   'user[name]': 'Ada',
 *   'user.address.city': 'London',
 *   'items[0][sku]': 'A1',
 *   'items[1][sku]': 'B2',
 *   remember: 'on',
 * })
 * // => {
 * //   user: { name: 'Ada', address: { city: 'London' } },
 * //   items: [{ sku: 'A1' }, { sku: 'B2' }],
 * //   remember: 'on',
 * // }
 *
 * unflattenFormFields({ 'tags[0]': 'a', 'tags[1]': 'b', 'tags[2]': 'c' })
 * // => { tags: ['a', 'b', 'c'] }
 *
 * unflattenFormFields({ '__proto__[admin]': 'yes' })
 * // => { ['__proto__']: { admin: 'yes' } }
 * ```
 *
 * @tags form, formdata, unflatten, nested, fields, urlencoded, brackets, query, parse, rails, php
 * @see unflatten - @ontologyio/receta/object, the dot-path nesting underneath
 * @see mapKeys - @ontologyio/receta/object, rewrites bracket names as dot paths
 */
export function unflattenFormFields(fields: Readonly<Record<string, unknown>>): PlainObject {
  return R.pipe(fields as PlainObject, mapKeys(toDotPath), unflatten())
}
