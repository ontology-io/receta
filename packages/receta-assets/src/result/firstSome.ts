import * as R from 'remeda'
import { isSome, none, type Option } from '@ontologyio/receta/option'

/**
 * Tries a list of lookups in order and returns the first Some, calling each one only if everything before it was None.
 *
 * Use when: a value has several places it may come from and missing is not an error until
 * all of them are empty, such as a locale from the user's setting, then the browser, then
 * the account; or a display name from a nickname, then a full name, then an email. Lookups
 * are functions, so later ones never run once an earlier one finds a value. All None, or an
 * empty list, is None.
 *
 * @example
 * ```ts
 * import { fromNullable, none, some, unwrapOr } from '@ontologyio/receta/option'
 *
 * const user = { nickname: undefined, fullName: 'Ada Lovelace', email: 'ada@example.com' }
 *
 * firstSome([() => fromNullable(user.nickname), () => fromNullable(user.fullName)])
 * // => Some('Ada Lovelace')
 *
 * firstSome([() => none(), () => none()])
 * // => None
 *
 * unwrapOr(firstSome([() => none<string>(), () => some('en-GB')]), 'en-US')
 * // => 'en-GB'
 * ```
 *
 * @tags fallback, first, coalesce, default, lookup, cascade, optional, settings
 * @see firstOk - the same for Results, keeping each reason
 * @see unwrapOr - @ontologyio/receta/option, the last-resort default
 */
export function firstSome<T>(lookups: readonly (() => Option<T>)[]): Option<T> {
  return R.reduce(
    lookups,
    (found: Option<T>, lookup) => (isSome(found) ? found : lookup()),
    none(),
  )
}
