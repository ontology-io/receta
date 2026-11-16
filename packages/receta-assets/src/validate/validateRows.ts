import * as R from 'remeda'
import {
  collectErrors,
  mapInvalid,
  schema,
  type FieldError,
  type Validation,
  type ValidationSchema,
} from '@ontologyio/receta/validation'

/**
 * Checks every row of a list against one schema and reports errors at paths like `lines[2].qty`.
 *
 * Use when: a form or request carries a list of objects, such as order lines, invitees or
 * spreadsheet rows, and each bad cell must be shown next to its input. Every row and every
 * field is checked. Each failing field gives one `{ field, errors }`, its `field` being the
 * list name, the row index and the field name, the shape form libraries use for nested inputs.
 *
 * ```text
 *  STEP                    DATA AFTER IT
 *  ──────────────────────  ─────────────────────────────────────────────────
 *  rows                    [{ sku: '', qty: 0 }, { sku: 'A1', qty: 2 }]
 *  schema(rules) each row  [Invalid([{ sku, … }, { qty, … }]), Valid(row 1)]
 *  mapInvalid → path       [Invalid([{ lines[0].sku }, { lines[0].qty }]), …]
 *  collectErrors           Invalid([{ lines[0].sku, … }, { lines[0].qty, … }])
 * ```
 *
 * @example
 * ```ts
 * import { min, required } from '@ontologyio/receta/validation'
 *
 * const lineRules = { sku: required('Enter a SKU'), qty: min(1, 'Order at least 1') }
 *
 * validateRows([{ sku: 'A1', qty: 2 }], lineRules, 'lines')
 * // => Valid([{ sku: 'A1', qty: 2 }])
 *
 * validateRows([{ sku: 'A1', qty: 2 }, { sku: '', qty: 0 }], lineRules, 'lines')
 * // => Invalid([
 * //   { field: 'lines[1].sku', errors: ['Enter a SKU'] },
 * //   { field: 'lines[1].qty', errors: ['Order at least 1'] },
 * // ])
 *
 * R.pipe([{ sku: 'B2', qty: 0 }], validateRows(lineRules, 'items'))
 * // => Invalid([{ field: 'items[0].qty', errors: ['Order at least 1'] }])
 * ```
 *
 * @tags rows, lines, list, nested, array, schema, path, form, table, import
 * @see schema - @ontologyio/receta/validation, the per-row check
 * @see validateEach - any validator per item, with errors by index
 */
export function validateRows<T extends object, E>(
  rows: readonly T[],
  rules: ValidationSchema<T, E>,
  listName: string,
): Validation<T[], FieldError<E>>
export function validateRows<T extends object, E>(
  rules: ValidationSchema<T, E>,
  listName: string,
): (rows: readonly T[]) => Validation<T[], FieldError<E>>
export function validateRows(...args: unknown[]): unknown {
  return R.purry(validateRowsImplementation, args)
}

const validateRowsImplementation = <T extends object, E>(
  rows: readonly T[],
  rules: ValidationSchema<T, E>,
  listName: string,
): Validation<T[], FieldError<E>> =>
  R.pipe(
    rows,
    R.map((row, index) =>
      R.pipe(
        schema(rules, row),
        mapInvalid((error: FieldError<E>) => ({ ...error, field: `${listName}[${index}].${error.field}` })),
      ),
    ),
    collectErrors(),
  )
