import * as R from 'remeda'
import { and, isNotEmpty, not, or, type Predicate } from '@ontologyio/receta/predicate'
import { isBlank } from '@ontologyio/receta/string'

/** A parsed query: one value, several for a repeated parameter, or none. Next.js `searchParams` fit. */
export type FilterFromQueryParams = Readonly<Record<string, string | readonly string[] | undefined>>

/** For each parameter you support, how one of its values becomes a predicate. */
export type FilterFromQueryBuilders<T> = Readonly<Record<string, (value: string) => Predicate<T>>>

const valuesOf = (params: FilterFromQueryParams | URLSearchParams, name: string): readonly string[] => {
  const raw = params instanceof URLSearchParams ? params.getAll(name) : params[name]
  const values = raw === undefined ? [] : R.isString(raw) ? [raw] : raw
  return R.pipe(values, R.map((value) => value.trim()), R.filter(not(isBlank)))
}

/**
 * Builds a list filter from URL query parameters: repeated values joined with OR, parameters with AND.
 *
 * Use when: a list page keeps its filters in the URL, like `?status=open&status=pending&q=db`,
 * so links can be shared and the back button works. You say how each supported parameter's
 * value becomes a predicate. Blank values are skipped, and parameters without a builder, such
 * as `page` or `utm_source`, are ignored. With no filter in the query, every item is kept.
 * Pass `URLSearchParams` or an already parsed object.
 *
 * ```text
 *  STEP                 DATA AFTER IT
 *  ───────────────────  ────────────────────────────────────────────────────
 *  query                ?city=Paris&city=Lyon&minBeds=3&page=2&q=
 *  supported, non-blank city: [Paris, Lyon] · minBeds: [3]
 *  build per value      city is Paris, city is Lyon · beds ≥ 3
 *  OR within a param    (city is Paris or city is Lyon) · beds ≥ 3
 *  AND across params    (city is Paris or city is Lyon) and beds ≥ 3
 * ```
 *
 * @example
 * ```ts
 * import { eq, gte, where } from '@ontologyio/receta/predicate'
 *
 * type Listing = { city: string; beds: number }
 * const listings: Listing[] = [{ city: 'Paris', beds: 2 }, { city: 'Lyon', beds: 3 }, { city: 'Nice', beds: 4 }]
 * const builders = {
 *   city: (city: string) => where<Listing>({ city: eq(city) }),
 *   minBeds: (beds: string) => where<Listing>({ beds: gte(Number(beds)) }),
 * }
 *
 * R.filter(listings, filterFromQuery(new URLSearchParams('city=Paris&city=Lyon&minBeds=3&page=2'), builders))
 * // => [{ city: 'Lyon', beds: 3 }]
 *
 * R.filter(listings, filterFromQuery({ city: ['Nice', 'Paris'], minBeds: ' ' }, builders))
 * // => [{ city: 'Paris', beds: 2 }, { city: 'Nice', beds: 4 }]
 *
 * R.filter(listings, filterFromQuery({}, builders)).length
 * // => 3
 * ```
 *
 * @tags query, url, search params, querystring, filter, facets, router, nextjs, shareable
 * @see facetFilter - picked values per field, without the URL
 * @see combineFilters - AND over filters you already built
 */
export function filterFromQuery<T>(
  params: FilterFromQueryParams | URLSearchParams,
  builders: FilterFromQueryBuilders<T>,
): Predicate<T> {
  const perParameter = R.pipe(
    R.entries(builders),
    R.map(([name, build]) => R.map(valuesOf(params, name), build)),
    R.filter(isNotEmpty),
    R.map((alternatives) => or(...alternatives)),
  )
  return and(...perParameter)
}
