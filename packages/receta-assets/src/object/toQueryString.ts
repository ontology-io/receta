import * as R from 'remeda'
import { isDate, isNullish } from '@ontologyio/receta/predicate'

type Pair = readonly [key: string, value: string]

const toText = (value: unknown): string => (isDate(value) ? value.toISOString() : String(value))

/** Every `key=value` pair a value produces, with nested keys written as `outer[inner]`. */
const pairsOf = (key: string, value: unknown): readonly Pair[] => {
  if (isNullish(value)) return []
  if (R.isArray(value)) return R.flatMap(value, (item) => pairsOf(key, item))
  if (R.isPlainObject(value)) return R.flatMap(R.entries(value), ([inner, nested]) => pairsOf(`${key}[${inner}]`, nested))
  return [[key, toText(value)]]
}

const encodePair = ([key, value]: Pair): string => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`

/**
 * Turns a params object into an encoded query string, skipping empty values and nesting with brackets.
 *
 * Use when: building the query of a search, filter or paginated list request from state,
 * where unset filters must disappear instead of showing up as `?status=undefined`. `null` and
 * `undefined` are skipped, `''` is kept. Arrays repeat the key (`tag=a&tag=b`), which
 * `URLSearchParams.getAll`, Express, FastAPI and Go read as a list. Nested objects use
 * brackets (`filter[status]=open`), as `qs`, Rails and PHP expect, encoded as `%5B` and `%5D`.
 * Dates become ISO strings. It returns no leading `?`. Lists of objects don't survive the
 * trip: send those as a JSON body.
 *
 * @example
 * ```ts
 * toQueryString({ q: 'red shoes', page: 2, tag: ['sale', 'new'], cursor: undefined, sort: null })
 * // => 'q=red%20shoes&page=2&tag=sale&tag=new'
 *
 * toQueryString({ filter: { status: 'open', owner: { id: 7 } }, since: new Date('2024-01-01T00:00:00Z') })
 * // => 'filter%5Bstatus%5D=open&filter%5Bowner%5D%5Bid%5D=7&since=2024-01-01T00%3A00%3A00.000Z'
 *
 * toQueryString({ draft: false, note: '' })
 * // => 'draft=false&note='
 *
 * toQueryString({})
 * // => ''
 * ```
 *
 * @tags query, querystring, url, search params, encode, filters, pagination, qs, get, serialize
 * @see unflattenFormFields - reads bracket names back into a nested object
 * @see isNullish - @ontologyio/receta/predicate, decides which values are skipped
 */
export function toQueryString(params: object): string {
  return R.pipe(
    R.entries(params as Record<string, unknown>),
    R.flatMap(([key, value]) => pairsOf(key, value)),
    R.map(encodePair),
    R.join('&'),
  )
}
