import * as R from 'remeda'
import { flatten, mapValues, type PlainObject } from '@ontologyio/receta/object'
import { isDate, isNullish } from '@ontologyio/receta/predicate'

const toCell = (value: unknown): string => {
  if (isNullish(value)) return ''
  if (isDate(value)) return value.toISOString()
  if (R.isArray(value)) return R.join(R.map(value, toCell), '; ')
  if (R.isPlainObject(value)) return ''
  return String(value)
}

/**
 * Flattens one nested record into `'a.b'` columns whose cells are all strings, ready for a CSV or a sheet row.
 *
 * Use when: exporting an order, user or event with nested fields to CSV, Excel or Google
 * Sheets, where each cell must be one string. Nested objects become dot-path columns
 * (`address.city`). Arrays stay in one cell, items joined with `'; '`. `null` and `undefined`
 * become `''`, dates become ISO strings, and an empty object becomes `''`. It doesn't quote
 * or escape: the CSV writer does that.
 *
 * @example
 * ```ts
 * const order = {
 *   id: 17,
 *   paid: true,
 *   customer: { name: 'Ada', address: { city: 'London' } },
 *   tags: ['gift', 'rush'],
 *   coupon: null,
 *   placedAt: new Date('2024-05-01T10:00:00Z'),
 * }
 *
 * flattenForCsv(order)
 * // => {
 * //   id: '17',
 * //   paid: 'true',
 * //   'customer.name': 'Ada',
 * //   'customer.address.city': 'London',
 * //   tags: 'gift; rush',
 * //   coupon: '',
 * //   placedAt: '2024-05-01T10:00:00.000Z',
 * // }
 *
 * flattenForCsv({ meta: {}, notes: [] })
 * // => { meta: '', notes: '' }
 * ```
 *
 * @tags csv, export, flatten, excel, spreadsheet, sheets, columns, row, report
 * @see toCsv - the whole export: headers, rows and quoting
 * @see flatten - @ontologyio/receta/object, the dot-path flattening
 */
export function flattenForCsv(record: object): Record<string, string> {
  return R.pipe(record as PlainObject, flatten(), mapValues(toCell))
}
