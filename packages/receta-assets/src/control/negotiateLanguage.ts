import * as R from 'remeda'
import { flatten, fromNullable, isSome, type Option } from '@ontologyio/receta/option'
import { between, by, eq, gt, startsWith, where } from '@ontologyio/receta/predicate'
import { parseNumber, unwrapOr } from '@ontologyio/receta/result'

type Preference = { readonly tag: string; readonly q: number }

const primaryOf = (tag: string): string => tag.toLowerCase().split('-')[0] ?? ''

/** `fr-CH;q=0.9` → `{ tag: 'fr-ch', q: 0.9 }`. A q that isn't a number from 0 to 1 counts as 0. */
const preferenceOf = (part: string): Preference => {
  const [tag = '', ...params] = R.map(part.split(';'), (piece) => piece.trim())
  const quality = R.find(params, startsWith('q='))
  const q = quality === undefined ? 1 : unwrapOr(parseNumber(quality.slice(2)), 0)
  return { tag: tag.toLowerCase(), q: between(0, 1)(q) ? q : 0 }
}

/** A supported locale for one preference: the same tag, else the same language, else any for `*`. */
const supportedFor =
  (supported: readonly string[]) =>
  ({ tag }: Preference): Option<string> => {
    if (eq('*')(tag)) return fromNullable(R.first(supported))
    const sameTag = R.find(supported, by((locale: string) => locale.toLowerCase(), eq(tag)))
    const sameLanguage = R.find(supported, by(primaryOf, eq(primaryOf(tag))))
    return fromNullable(sameTag ?? sameLanguage)
  }

/**
 * Picks the best supported locale for an `Accept-Language` header, honoring its quality weights.
 *
 * Use when: a server, an edge function or a middleware chooses the language of a page, an email
 * or an API message from what the browser asks for. Preferences are tried from the highest `q`
 * down, in header order on ties; for each, an exact tag wins, then the same language with another
 * region (`fr-CH` finds `fr`, `en` finds `en-US`). `q=0` means "not this one". The locale comes
 * back as spelled in `supported`. `None` when nothing fits, so the caller picks the default.
 *
 * @example
 * ```ts
 * import { unwrapOr } from '@ontologyio/receta/option'
 *
 * negotiateLanguage('fr-CH, fr;q=0.9, en;q=0.8', ['en-US', 'fr'])
 * // => Some('fr')
 *
 * negotiateLanguage('de;q=0.5, en-GB', ['de', 'en-US'])
 * // => Some('en-US')
 *
 * negotiateLanguage('ja, en;q=0', ['en', 'fr'])
 * // => None
 *
 * R.pipe(null, negotiateLanguage(['en', 'ar']), unwrapOr('en'))
 * // => 'en'
 * ```
 *
 * @tags i18n, locale, language, accept-language, content negotiation, header, translation
 * @see by - @ontologyio/receta/predicate, compares locales case-insensitively and by language
 * @see routePath - the other half of routing a request
 */
export function negotiateLanguage(
  header: string | null | undefined,
  supported: readonly string[],
): Option<string>
export function negotiateLanguage(
  supported: readonly string[],
): (header: string | null | undefined) => Option<string>
export function negotiateLanguage(...args: unknown[]): unknown {
  return R.purry(negotiateLanguageImplementation, args)
}

const negotiateLanguageImplementation = (
  header: string | null | undefined,
  supported: readonly string[],
): Option<string> =>
  R.pipe(
    (header ?? '').split(','),
    R.map(preferenceOf),
    R.filter(where<Preference>({ tag: Boolean, q: gt(0) })),
    R.sortBy([R.prop('q'), 'desc']),
    R.map(supportedFor(supported)),
    R.find((locale) => isSome(locale)),
    fromNullable,
    flatten(),
  )
