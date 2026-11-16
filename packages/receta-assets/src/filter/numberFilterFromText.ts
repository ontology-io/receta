import * as R from 'remeda'
import { fromNullable, match } from '@ontologyio/receta/option'
import { always, between, eq, gt, gte, lt, lte, neq, type Predicate } from '@ontologyio/receta/predicate'
import { collect, err, flatMap, map, mapErr, ok, parseNumber, type Result } from '@ontologyio/receta/result'

export type NumberFilterFromTextError = {
  readonly code: 'NOT_A_FILTER' | 'REVERSED_RANGE'
  readonly input: string
  readonly message: string
}

const NUMBER = String.raw`[-+]?(?:\d+(?:\.\d*)?|\.\d+)`
const RANGE = new RegExp(String.raw`^(${NUMBER})\s*\.\.\s*(${NUMBER})$`)
const COMPARISON = new RegExp(String.raw`^(>=|<=|!=|>|<|=)?\s*(${NUMBER})$`)

const OPERATORS: Readonly<Record<string, (bound: number) => Predicate<number>>> = {
  '>': gt,
  '>=': gte,
  '<': lt,
  '<=': lte,
  '=': eq,
  '!=': neq,
}

const notAFilter = (input: string): NumberFilterFromTextError => ({
  code: 'NOT_A_FILTER',
  input,
  message: `"${input}" is not a number filter. Try 10, >= 10, < 5, != 0 or 3..8`,
})

const fromRange = (input: string, low: string, high: string): Result<Predicate<number>, NumberFilterFromTextError> =>
  R.pipe(
    collect([parseNumber(low), parseNumber(high)]),
    mapErr(() => notAFilter(input)),
    flatMap(([min = 0, max = 0]) =>
      min <= max
        ? ok(between(min, max))
        : err<NumberFilterFromTextError>({ code: 'REVERSED_RANGE', input, message: `Put the smaller number first: ${max}..${min}` }),
    ),
  )

const fromComparison = (input: string, operator: string | undefined, bound: string): Result<Predicate<number>, NumberFilterFromTextError> =>
  R.pipe(
    parseNumber(bound),
    mapErr(() => notAFilter(input)),
    map((value) => (OPERATORS[operator ?? '='] ?? eq)(value)),
  )

/**
 * Turns a number filter typed as text, like `>= 10`, `< 5`, `!= 0` or `3..8`, into a predicate.
 *
 * Use when: a data table, admin search or spreadsheet-like grid lets people type a condition
 * into a column filter instead of picking an operator from a menu. A bare number means equal,
 * and a range includes both ends. A blank filter keeps everything. Text that isn't a filter
 * gives `NOT_A_FILTER` with a hint, and a range written high to low gives `REVERSED_RANGE`.
 *
 * @example
 * ```ts
 * import { map, mapErr } from '@ontologyio/receta/result'
 *
 * const prices = [5, 10, 20, 35]
 *
 * R.pipe(numberFilterFromText('>= 10'), map((keep) => R.filter(prices, keep)))
 * // => Ok([10, 20, 35])
 *
 * R.pipe(numberFilterFromText(' 6..20 '), map((keep) => R.filter(prices, keep)))
 * // => Ok([10, 20])
 *
 * R.pipe(numberFilterFromText(''), map((keep) => R.filter(prices, keep)))
 * // => Ok([5, 10, 20, 35])
 *
 * R.pipe(numberFilterFromText('about 10'), mapErr((error) => error.code))
 * // => Err('NOT_A_FILTER')
 *
 * R.pipe(numberFilterFromText('8..3'), mapErr((error) => error.message))
 * // => Err('Put the smaller number first: 3..8')
 * ```
 *
 * @tags number, filter, operator, comparison, range, column, table, grid, query, parse
 * @see gt - @ontologyio/receta/predicate, and gte, lt, lte, eq, neq, between, the predicates made
 */
export function numberFilterFromText(input: string): Result<Predicate<number>, NumberFilterFromTextError> {
  const text = input.trim()
  if (text === '') return ok(always<number>())
  return R.pipe(
    fromNullable(RANGE.exec(text)),
    match({
      onSome: ([, low = '', high = '']) => fromRange(input, low, high),
      onNone: () =>
        R.pipe(
          fromNullable(COMPARISON.exec(text)),
          match({
            onSome: ([, operator, bound = '']) => fromComparison(input, operator, bound),
            onNone: () => err(notAFilter(input)),
          }),
        ),
    }),
  )
}
