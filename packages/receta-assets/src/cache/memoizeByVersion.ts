import * as R from 'remeda'
import { clearCache, memoizeBy } from '@ontologyio/receta/memo'
import { filter, isSome, none, some, type Option } from '@ontologyio/receta/option'
import { neq } from '@ontologyio/receta/predicate'

/**
 * Memoizes a function and forgets every result as soon as a version it reads changes, such as a locale or a data revision.
 *
 * Use when: results depend on something global besides the arguments, such as translations
 * that depend on the current locale, prices that depend on a rate table's revision, or
 * permissions that depend on the role table's version. `versionOf` is read on every call;
 * when it differs from the last call's (by `!==`), the cache is cleared first. The key
 * defaults to the first argument; pass `keyOf` when the function takes more than one.
 *
 * @example
 * ```ts
 * const messages = { en: { hello: 'Hello' }, es: { hello: 'Hola' } }
 * let locale: 'en' | 'es' = 'en'
 * let lookups = 0
 * const translate = (id: 'hello') => {
 *   lookups += 1
 *   return messages[locale][id]
 * }
 * const t = memoizeByVersion(translate, () => locale)
 *
 * t('hello')
 * t('hello')
 * // => 'Hello'
 *
 * locale = 'es'
 * t('hello')
 * // => 'Hola'
 *
 * lookups
 * // => 2
 * ```
 *
 * @tags memoize, version, revision, locale, invalidate, generation, epoch
 * @see memoizeBy - @ontologyio/receta/memo, the cache underneath
 * @see invalidateAfter - drops entries after a write instead of on a version change
 */
export function memoizeByVersion<A extends readonly unknown[], T>(
  fn: (...args: A) => T,
  versionOf: () => unknown,
  keyOf: (...args: A) => unknown = (...args) => args[0],
): (...args: A) => T {
  const memoized = memoizeBy(fn, keyOf)
  let seenVersion: Option<unknown> = none()
  return (...args) => {
    const version = versionOf()
    const changed = R.pipe(seenVersion, filter(neq(version)), isSome)
    if (changed) clearCache(memoized)
    seenVersion = some(version)
    return memoized(...args)
  }
}
