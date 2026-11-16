import * as R from 'remeda'
import {
  byBoolean,
  byDate,
  byNumber,
  compose,
  natural,
  reverse,
  type Comparator,
} from '@ontologyio/receta/compare'
import { eq, isNullish, or } from '@ontologyio/receta/predicate'

export type SortByColumnOptions<T> = {
  /** The field to sort by, usually from the table header the user clicked. */
  readonly column: keyof T
  readonly direction: 'asc' | 'desc'
}

/**
 * Sorts table rows by a column and direction the user picked, comparing each cell by its type, blanks last.
 *
 * Use when: a data table sorts on a header click, or reads `?sort=price&dir=desc` from the URL,
 * and the columns hold a mix of numbers, text, dates and booleans. Numbers compare as numbers,
 * dates by time, booleans with false first, and text naturally ('Item 2' before 'item 10',
 * case ignored). Blank cells (`null`, `undefined`, `''` and `NaN`) go last in both directions.
 * Two cells of different types compare as text. Equal cells keep their input order.
 *
 * @example
 * ```ts
 * const products = [
 *   { name: 'item 10', price: 25 },
 *   { name: 'Item 2', price: null },
 *   { name: 'Item 1', price: 40 },
 *   { name: 'item 3', price: 25 },
 * ]
 *
 * R.pipe(sortByColumn(products, { column: 'price', direction: 'desc' }), R.map(R.prop('name')))
 * // => ['Item 1', 'item 10', 'item 3', 'Item 2']
 *
 * R.pipe(products, sortByColumn({ column: 'name', direction: 'asc' }), R.map(R.prop('name')))
 * // => ['Item 1', 'Item 2', 'item 3', 'item 10']
 * ```
 *
 * @tags sort, table, data grid, column, header click, direction, blanks last, mixed types, url
 * @see sortByKeys - several fields at once from a list of rules
 * @see sortNullsLast - one typed field with missing values last
 */
export function sortByColumn<T>(rows: readonly T[], options: SortByColumnOptions<NoInfer<T>>): readonly T[]
export function sortByColumn<T>(options: SortByColumnOptions<T>): (rows: readonly T[]) => readonly T[]
export function sortByColumn(...args: unknown[]): unknown {
  return R.purry(sortByColumnImplementation, args)
}

const isBlank = or<unknown>(isNullish, eq(''), Number.isNaN)

const numbers = byNumber((cell: number) => cell)
const dates = byDate((cell: Date) => cell)
const booleans = byBoolean((cell: boolean) => cell)
const text = natural((cell: unknown) => String(cell))

const compareCells: Comparator<unknown> = (a, b) => {
  if (R.isNumber(a) && R.isNumber(b)) return numbers(a, b)
  if (R.isDate(a) && R.isDate(b)) return dates(a, b)
  if (R.isBoolean(a) && R.isBoolean(b)) return booleans(a, b)
  return text(a, b)
}

const sortByColumnImplementation = <T>(rows: readonly T[], { column, direction }: SortByColumnOptions<T>): readonly T[] => {
  const directed = direction === 'desc' ? reverse(compareCells) : compareCells
  const cells = compose<unknown>(
    // false before true, so a blank cell sorts after a filled one whatever the direction.
    byBoolean(isBlank),
    (a, b) => (isBlank(a) ? 0 : directed(a, b)),
  )
  return R.sort(rows, (a, b) => cells(a[column], b[column]))
}
