import * as R from 'remeda'
import { fromNullable, match } from '@ontologyio/receta/option'
import { by, eq } from '@ontologyio/receta/predicate'
import { invalid, valid, type Validation } from '@ontologyio/receta/validation'

/**
 * Matches typed or query-string input to one of the allowed choices, ignoring case and spaces.
 *
 * Use when: a value arrives as free text, from a query string, a CSV column or a hand-edited
 * config, and must become one of a fixed set, such as a size, plan or sort order. `' LARGE '`
 * comes back as the choice's own spelling, `'Large'`, typed as the union of choices. The
 * message lists the choices, so the person sees what to type.
 *
 * @example
 * ```ts
 * validateChoice(' LARGE ', ['Small', 'Medium', 'Large'])
 * // => Valid('Large')
 *
 * validateChoice('huge', ['Small', 'Medium', 'Large'])
 * // => Invalid(['Choose one of: Small, Medium, Large'])
 *
 * R.pipe('asc', validateChoice(['asc', 'desc'] as const))
 * // => Valid('asc')
 * ```
 *
 * @tags choice, enum, option, select, one of, allowed, case-insensitive, query, union
 * @see oneOf - @ontologyio/receta/validation, exact matches only, without the canonical spelling
 */
export function validateChoice<C extends string>(input: string, choices: readonly C[]): Validation<C, string>
export function validateChoice<C extends string>(choices: readonly C[]): (input: string) => Validation<C, string>
export function validateChoice(...args: unknown[]): unknown {
  return R.purry(validateChoiceImplementation, args)
}

const validateChoiceImplementation = <C extends string>(input: string, choices: readonly C[]): Validation<C, string> => {
  const wanted = input.trim().toLowerCase()
  return R.pipe(
    fromNullable(R.find(choices, by((choice: C) => choice.toLowerCase(), eq(wanted)))),
    match<C, Validation<C, string>>({
      onSome: valid,
      onNone: () => invalid(`Choose one of: ${R.join(choices, ', ')}`),
    }),
  )
}
