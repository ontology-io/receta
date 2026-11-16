import * as R from 'remeda'
import { flatten, mapValues, type PlainObject } from '@ontologyio/receta/object'
import { isDate, isNullish, matches } from '@ontologyio/receta/predicate'

const toCell = (value: unknown): string => {
  if (isNullish(value)) return ''
  if (isDate(value)) return value.toISOString()
  if (R.isArray(value)) return R.join(R.map(value, toCell), '; ')
  if (R.isPlainObject(value)) return ''
  return String(value)
}

const flattenRow = (record: object): Record<string, string> =>
  R.pipe(record as PlainObject, flatten(), mapValues(toCell))

const needsQuotes = matches(/[",\r\n]/)

const quote = (cell: string): string => (needsQuotes(cell) ? `"${cell.replaceAll('"', '""')}"` : cell)

const toLine = (cells: readonly string[]): string => R.join(R.map(cells, quote), ',')

/**
 * Turns a list of nested records into CSV text, with a header row covering every field any record has.
 *
 * Use when: offering a "download as CSV" of orders, users or events, where records are nested
 * and don't all have the same fields. Nested fields become dot-path columns, in the order
 * they first appear. A record without a column gets an empty cell. Arrays share one cell,
 * joined with `'; '`; dates become ISO strings. Cells with a comma, quote or line break are
 * quoted as RFC 4180 says, and lines end in `\r\n`. An empty list gives `''`. It doesn't
 * defuse spreadsheet formulas: a cell starting with `=` stays as it is.
 *
 * ```text
 *  STEP                 DATA AFTER IT
 *  ──────────────────   ──────────────────────────────────────────────
 *  records              [{ id 1, user { name 'Ada' } }, { id 2, note 'a,b' }]
 *  flatten each         [{ id '1', user.name 'Ada' }, { id '2', note 'a,b' }]
 *  union of keys        ['id', 'user.name', 'note']
 *  cell per column      [['1', 'Ada', ''], ['2', '', 'a,b']]
 *  quote, join          'id,user.name,note\r\n1,Ada,\r\n2,,"a,b"'
 * ```
 *
 * @example
 * ```ts
 * toCsv([
 *   { id: 1, user: { name: 'Ada' } },
 *   { id: 2, note: 'a,b' },
 * ])
 * // => 'id,user.name,note\r\n1,Ada,\r\n2,,"a,b"'
 *
 * toCsv([{ quote: 'She said "hi"', tags: ['x', 'y'] }])
 * // => 'quote,tags\r\n"She said ""hi""",x; y'
 *
 * toCsv([])
 * // => ''
 * ```
 *
 * @tags csv, export, download, excel, spreadsheet, report, rfc4180, table, serialize
 * @see flattenForCsv - one record as flat string cells, without the CSV text
 * @see flatten - @ontologyio/receta/object, the dot-path flattening
 */
export function toCsv(records: readonly object[]): string {
  const rows = R.map(records, flattenRow)
  const headers = R.pipe(rows, R.flatMap((row) => R.keys(row)), R.unique())
  const cellsOf = (row: Record<string, string>): readonly string[] => R.map(headers, (header) => row[header] ?? '')
  const body = R.map(rows, (row) => toLine(cellsOf(row)))
  return R.join([toLine(headers), ...body], '\r\n')
}
