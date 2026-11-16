import * as R from 'remeda'
import { by, eq } from '@ontologyio/receta/predicate'
import { fromNullable, type Result } from '@ontologyio/receta/result'

export type ParseEnumError<A extends string> = {
  readonly code: 'NOT_ALLOWED'
  readonly input: string
  /** The values that would have been accepted. */
  readonly allowed: readonly A[]
  readonly message: string
}

const lowered = (value: string): string => value.trim().toLowerCase()

/**
 * Matches text against a fixed list of allowed values, ignoring case and spaces, and returns the value as listed.
 *
 * Use when: a status, role, sort order, log level or plan name comes in as text and the code
 * needs the exact literal type, such as `'asc' | 'desc'`. `' Published '` matches
 * `'published'` and comes back spelled as the list spells it. Anything else is an `Err` that
 * lists what was allowed, ready to show the caller.
 *
 * @example
 * ```ts
 * const statuses = ['draft', 'published', 'archived'] as const
 *
 * parseEnum(' Published ', statuses)
 * // => Ok('published')
 *
 * R.pipe('DESC', parseEnum(['asc', 'desc']))
 * // => Ok('desc')
 *
 * parseEnum('deleted', statuses)
 * // => Err({ code: 'NOT_ALLOWED', input: 'deleted', allowed: ['draft', 'published', 'archived'], message: 'Expected one of draft, published, archived, got "deleted"' })
 * ```
 *
 * @tags enum, literal, union, allowed values, status, role, sort order, log level
 * @see by - @ontologyio/receta/predicate, compares the lowercased forms
 * @see oneOf - @ontologyio/receta/predicate, the exact-match check without parsing
 */
export function parseEnum<const A extends string>(
  input: string,
  allowed: readonly A[],
): Result<A, ParseEnumError<A>>
export function parseEnum<const A extends string>(
  allowed: readonly A[],
): (input: string) => Result<A, ParseEnumError<A>>
export function parseEnum(...args: unknown[]): unknown {
  return R.purry(parseEnumImplementation, args)
}

const parseEnumImplementation = <A extends string>(
  input: string,
  allowed: readonly A[],
): Result<A, ParseEnumError<A>> =>
  fromNullable(R.find(allowed, by(lowered, eq(lowered(input)))), {
    code: 'NOT_ALLOWED',
    input,
    allowed,
    message: `Expected one of ${R.join(allowed, ', ')}, got "${input}"`,
  })
