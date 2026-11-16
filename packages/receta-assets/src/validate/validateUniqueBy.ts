import * as R from 'remeda'
import { by, gt } from '@ontologyio/receta/predicate'
import { invalid, valid, type Validation } from '@ontologyio/receta/validation'

/** `[1, 3]` reads as `rows 1 and 3`, `[1, 3, 5]` as `rows 1, 3 and 5`. */
const rowList = (rows: readonly number[]): string => {
  const last = R.last(rows)
  const rest = R.dropLast(rows, 1)
  return R.isEmpty(rest) ? `row ${last}` : `rows ${R.join(rest, ', ')} and ${last}`
}

/**
 * Checks that no two items in a list share a key, and names the rows of each repeated key.
 *
 * Use when: importing a CSV or saving a bulk edit where emails, SKUs or usernames must be
 * unique, and the person needs to know which rows clash so they can fix the file. Rows are
 * numbered from 1, as a spreadsheet shows them. One message per repeated key, in the order
 * the key first appears. The items come back unchanged.
 *
 * @example
 * ```ts
 * const people = [{ email: 'ada@example.com' }, { email: 'grace@example.com' }]
 *
 * validateUniqueBy(people, (person) => person.email)
 * // => Valid([{ email: 'ada@example.com' }, { email: 'grace@example.com' }])
 *
 * validateUniqueBy(['A1', 'B2', 'A1', 'C3', 'A1', 'B2'], R.identity())
 * // => Invalid(['"A1" appears in rows 1, 3 and 5', '"B2" appears in rows 2 and 6'])
 *
 * R.pipe([{ sku: 'x' }, { sku: 'x' }], validateUniqueBy((row) => row.sku.toLowerCase()))
 * // => Invalid(['"x" appears in rows 1 and 2'])
 * ```
 *
 * @tags unique, duplicates, dedupe, import, csv, bulk, rows, conflict, key
 * @see validateTags - a list of strings with repeats found ignoring case
 */
export function validateUniqueBy<T>(items: readonly T[], key: (item: T) => string): Validation<readonly T[], string>
export function validateUniqueBy<T>(key: (item: T) => string): (items: readonly T[]) => Validation<readonly T[], string>
export function validateUniqueBy(...args: unknown[]): unknown {
  return R.purry(validateUniqueByImplementation, args)
}

const validateUniqueByImplementation = <T>(items: readonly T[], key: (item: T) => string): Validation<readonly T[], string> => {
  const clashes = R.pipe(
    items,
    R.map((item, index) => ({ key: key(item), row: index + 1 })),
    R.groupBy(R.prop('key')),
    R.values(),
    R.filter(by((rows) => rows.length, gt(1))),
    R.map((rows) => `"${rows[0].key}" appears in ${rowList(R.map(rows, R.prop('row')))}`),
  )
  return R.isEmpty(clashes) ? valid(items) : invalid(clashes)
}
