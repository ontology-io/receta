import * as R from 'remeda'
import { switchCase } from '@ontologyio/receta/function'
import { where, type PredicateSchema } from '@ontologyio/receta/predicate'

export type DecisionTableRow<T, U> = {
  /** A condition per field. A field left out matches any value. */
  readonly when: PredicateSchema<T>
  readonly outcome: U
}

/**
 * Looks up an outcome in a table of rows, each a set of field conditions, and falls back to a default.
 *
 * Use when: a business rule is a table someone could write in a spreadsheet, such as shipping
 * rates by country and weight, approval levels by amount and department, or SLA targets by plan
 * and severity. Rows are read top to bottom and the first row whose conditions all hold wins.
 * `otherwise` is required, so every input gets an outcome.
 *
 * ```text
 *  input { country: 'US', weightKg: 3 }
 *
 *  ROW  country      weightKg   OUTCOME   CHECKED
 *  ───  ───────────  ─────────  ────────  ─────────────────────────
 *  1    eq('US')     lte(1)     5         weightKg fails, next row
 *  2    eq('US')     any        12        all hold: returns 12
 *  3    any          lte(1)     15        not reached
 *       otherwise               40        only when no row holds
 * ```
 *
 * @example
 * ```ts
 * import { eq, lte } from '@ontologyio/receta/predicate'
 *
 * type Parcel = { country: string; weightKg: number }
 * const shipping = [
 *   { when: { country: eq('US'), weightKg: lte(1) }, outcome: 5 },
 *   { when: { country: eq('US') }, outcome: 12 },
 *   { when: { weightKg: lte(1) }, outcome: 15 },
 * ]
 *
 * decisionTable({ country: 'US', weightKg: 3 }, shipping, 40)
 * // => 12
 *
 * decisionTable({ country: 'FR', weightKg: 0.5 }, shipping, 40)
 * // => 15
 *
 * // In a pipe, name the input type: the rows alone can't tell what fields it has.
 * R.pipe({ country: 'FR', weightKg: 3 }, decisionTable<Parcel, number>(shipping, 40))
 * // => 40
 * ```
 *
 * @tags decision table, rules, lookup, matrix, pricing, shipping, policy, switch
 * @see where - @ontologyio/receta/predicate, turns each row's conditions into one predicate
 * @see switchCase - @ontologyio/receta/function, first match with a required default
 * @see firstMatchingRule - rules as functions, with the matching rule's name
 */
export function decisionTable<T extends object, U>(
  input: T,
  rows: readonly DecisionTableRow<T, U>[],
  otherwise: U,
): U
export function decisionTable<T extends object, U>(
  rows: readonly DecisionTableRow<T, U>[],
  otherwise: U,
): (input: T) => U
export function decisionTable(...args: unknown[]): unknown {
  return R.purry(decisionTableImplementation, args)
}

const decisionTableImplementation = <T extends object, U>(
  input: T,
  rows: readonly DecisionTableRow<T, U>[],
  otherwise: U,
): U =>
  switchCase(
    R.map(rows, (row) => [where<T>(row.when), R.constant(row.outcome)] as const),
    otherwise,
    input,
  )
