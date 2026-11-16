import * as R from 'remeda'
import { by, isDefined, or, type Predicate } from '@ontologyio/receta/predicate'

/**
 * Builds a predicate that keeps items where at least one of the named fields passes a test.
 *
 * Use when: the same kind of value sits in several fields and any of them should count, such
 * as a work email in `email` or `backupEmail`, a city in a billing or shipping address, or a
 * flag set on any of three checks. Missing and `null` fields are skipped, so the test only
 * sees real values.
 *
 * @example
 * ```ts
 * import { endsWith, gt } from '@ontologyio/receta/predicate'
 *
 * const users = [
 *   { name: 'Ada', email: 'ada@corp.com', backupEmail: null },
 *   { name: 'Alan', email: 'alan@gmail.com', backupEmail: 'alan@corp.com' },
 *   { name: 'Grace', email: 'grace@gmail.com', backupEmail: null },
 * ]
 *
 * R.map(R.filter(users, anyFieldMatches(['email', 'backupEmail'], endsWith('@corp.com'))), R.prop('name'))
 * // => ['Ada', 'Alan']
 *
 * R.filter([{ cpu: 40, memory: 95 }, { cpu: 20, memory: 30 }], anyFieldMatches(['cpu', 'memory'], gt(90)))
 * // => [{ cpu: 40, memory: 95 }]
 * ```
 *
 * @tags any field, some, or, multiple fields, alias, fallback, columns, filter
 * @see where - @ontologyio/receta/predicate, one test per field, all of them
 */
export function anyFieldMatches<K extends PropertyKey, V>(
  keys: readonly K[],
  test: Predicate<V>,
): Predicate<{ readonly [P in K]?: V | null | undefined }> {
  const passes = (value: V | null | undefined): boolean => isDefined(value) && test(value)
  return or(...R.map(keys, (key) => by((item: { readonly [P in K]?: V | null | undefined }) => item[key], passes)))
}
