import * as R from 'remeda'
import { and, by, isNotEmpty, oneOf, type Predicate } from '@ontologyio/receta/predicate'

/** A list field is filtered by its elements, so `sizes: string[]` takes selected sizes. */
export type FacetFilterValue<V> = V extends readonly (infer E)[] ? E : V

/** For each field, the values picked in its facet. An empty or absent list means no filter. */
export type FacetFilterSelection<T> = { readonly [K in keyof T]?: readonly FacetFilterValue<T[K]>[] }

const matchesFacet = (selected: readonly unknown[]) => {
  const isSelected = oneOf(selected)
  return (value: unknown): boolean => (R.isArray(value) ? value.some(isSelected) : isSelected(value))
}

/**
 * Builds the predicate behind a faceted search sidebar: any picked value per facet, all facets together.
 *
 * Use when: a catalog, job board or log viewer has checkbox groups such as brand, color and
 * size, and the list must keep items matching any checked value in each group and every
 * group that has a check. A group with nothing checked doesn't filter. For a field holding a
 * list, such as `sizes`, an item matches when any of its values is checked. Values match
 * exactly; normalize case before if your data needs it.
 *
 * ```text
 *  STEP                DATA AFTER IT
 *  ──────────────────  ──────────────────────────────────────────────────
 *  selection           { color: ['red', 'blue'], size: [], brand: ['acme'] }
 *  drop empty facets   { color: ['red', 'blue'], brand: ['acme'] }
 *  OR within a facet   color is red or blue · brand is acme
 *  AND across facets   (color is red or blue) and (brand is acme)
 * ```
 *
 * @example
 * ```ts
 * type Shoe = { name: string; color: string; brand: string; sizes: number[] }
 * const shoes: Shoe[] = [
 *   { name: 'Runner', color: 'red', brand: 'acme', sizes: [40, 41] },
 *   { name: 'Trail', color: 'blue', brand: 'zeta', sizes: [42] },
 *   { name: 'Court', color: 'blue', brand: 'acme', sizes: [42, 43] },
 * ]
 *
 * R.map(R.filter(shoes, facetFilter<Shoe>({ color: ['red', 'blue'], brand: ['acme'], sizes: [] })), R.prop('name'))
 * // => ['Runner', 'Court']
 *
 * R.map(R.filter(shoes, facetFilter<Shoe>({ sizes: [42] })), R.prop('name'))
 * // => ['Trail', 'Court']
 *
 * R.filter(shoes, facetFilter<Shoe>({})).length
 * // => 3
 * ```
 *
 * @tags facet, faceted search, sidebar, checkbox, filter, catalog, refine, and, or
 * @see filterFromQuery - the same idea, read from URL query parameters
 * @see where - @ontologyio/receta/predicate, one predicate per field
 */
export function facetFilter<T extends object>(selection: FacetFilterSelection<T>): Predicate<T> {
  const facets = R.pipe(
    R.entries(selection as Readonly<Record<string, readonly unknown[] | undefined>>),
    R.filter(by(([, values]) => values ?? [], isNotEmpty)),
    R.map(([key, values = []]) => by((item: T) => R.prop(item as Readonly<Record<string, unknown>>, key), matchesFacet(values))),
  )
  return and(...facets)
}
