import * as R from 'remeda'
import { descending } from '@ontologyio/receta/compare'
import { fromNullable, partition } from '@ontologyio/receta/option'
import { gt, where } from '@ontologyio/receta/predicate'

type Weighted = { readonly tag: string; readonly q: number }

const ENTRY = /^\s*([A-Za-z]{1,8}(?:-[A-Za-z0-9]{1,8})*|\*)\s*(?:;\s*q\s*=\s*(0(?:\.\d{0,3})?|1(?:\.0{0,3})?))?\s*$/

/**
 * Reads an `Accept-Language` header into language tags ordered by preference, such as `['fr-CH', 'fr', 'en']`.
 *
 * Use when: choosing the locale for a page, an email or an API response from what the
 * browser asks for, before matching against the locales you support. Tags are ordered by
 * their `q` weight, highest first, keeping the header's order between equal weights. Tags
 * with `q=0` mean "not this one" and are dropped, malformed parts are skipped, and `*` is
 * kept where it ranks. A missing or empty header is an empty list.
 *
 * ```text
 *  STEP                    DATA AFTER IT
 *  ──────────────────────  ─────────────────────────────────────────────
 *  header                  'en;q=0.8, fr-CH, de;q=0, fr;q=0.9, x!'
 *  split ',' and match     [Some(en 0.8), Some(fr-CH), Some(de 0), …, None]
 *  partition               [{en 0.8}, {fr-CH 1}, {de 0}, {fr 0.9}]
 *  R.filter(q > 0)         [{en 0.8}, {fr-CH 1}, {fr 0.9}]
 *  R.sort(descending q)    [{fr-CH 1}, {fr 0.9}, {en 0.8}]
 *  R.map(tag)              ['fr-CH', 'fr', 'en']
 * ```
 *
 * @example
 * ```ts
 * parseAcceptLanguage('en;q=0.8, fr-CH, de;q=0, fr;q=0.9, x!')
 * // => ['fr-CH', 'fr', 'en']
 *
 * parseAcceptLanguage('en-US,en;q=0.9,*;q=0.5')
 * // => ['en-US', 'en', '*']
 *
 * parseAcceptLanguage(undefined)
 * // => []
 * ```
 *
 * @tags accept language, locale, i18n, language, negotiation, header, translation
 * @see negotiateLanguage - picks the best of your supported locales from the header
 * @see descending - @ontologyio/receta/compare, orders by weight
 * @see partition - @ontologyio/receta/option, drops the parts that didn't parse
 */
export function parseAcceptLanguage(header: string | null | undefined): readonly string[] {
  const [entries] = R.pipe(
    R.split(header ?? '', ','),
    R.map((part) => fromNullable(ENTRY.exec(part))),
    (matches) => partition(matches),
  )
  return R.pipe(
    entries,
    R.map(([, tag = '', q]): Weighted => ({ tag, q: q === undefined ? 1 : Number(q) })),
    R.filter(where<Weighted>({ q: gt(0) })),
    R.sort(descending((entry: Weighted) => entry.q)),
    R.map(R.prop('tag')),
  )
}
