import * as R from 'remeda'
import { ascending } from '@ontologyio/receta/compare'

export type SortByDistanceFromPoint = { readonly lat: number; readonly lng: number }

export type SortByDistanceFromEntry<T> = {
  readonly item: T
  /** Great-circle distance from the origin, in kilometres. */
  readonly distanceKm: number
}

/**
 * Sorts places by distance from a point, nearest first, and gives each one its distance in kilometres.
 *
 * Use when: listing stores near the user, the closest drivers to a pickup, or venues around a
 * map pin. Distances follow the curve of the Earth (the haversine formula), which is accurate
 * to well under 1% for this purpose; it is not road distance. Coordinates are in degrees.
 * Places at the same distance keep their input order.
 *
 * @example
 * ```ts
 * import { round } from '@ontologyio/receta/number'
 *
 * const berlin = { lat: 52.52, lng: 13.405 }
 * const stores = [
 *   { name: 'Hamburg', at: { lat: 53.551, lng: 9.994 } },
 *   { name: 'Potsdam', at: { lat: 52.391, lng: 13.065 } },
 *   { name: 'Spandau', at: { lat: 52.535, lng: 13.2 } },
 * ]
 *
 * R.pipe(
 *   sortByDistanceFrom(stores, berlin, (store) => store.at),
 *   R.map(({ item, distanceKm }) => `${item.name} ${round(distanceKm, 0)} km`),
 * )
 * // => ['Spandau 14 km', 'Potsdam 27 km', 'Hamburg 255 km']
 *
 * R.pipe([berlin], sortByDistanceFrom(berlin, R.identity()), R.map(R.prop('distanceKm')))
 * // => [0]
 * ```
 *
 * @tags sort, distance, nearest, closest, near me, geo, location, haversine, map, latitude, longitude
 * @see sortByClosestTo - nearest by a single number instead of a map position
 * @see ascending - @ontologyio/receta/compare, the nearest-first order
 */
export function sortByDistanceFrom<T>(
  items: readonly T[],
  origin: SortByDistanceFromPoint,
  location: (item: T) => SortByDistanceFromPoint,
): readonly SortByDistanceFromEntry<T>[]
export function sortByDistanceFrom<T>(
  origin: SortByDistanceFromPoint,
  location: (item: T) => SortByDistanceFromPoint,
): (items: readonly T[]) => readonly SortByDistanceFromEntry<T>[]
export function sortByDistanceFrom(...args: unknown[]): unknown {
  return R.purry(sortByDistanceFromImplementation, args)
}

const EARTH_RADIUS_KM = 6371

const toRadians = (degrees: number): number => (degrees * Math.PI) / 180

const haversineKm = (from: SortByDistanceFromPoint, to: SortByDistanceFromPoint): number => {
  const latitudeDelta = toRadians(to.lat - from.lat)
  const longitudeDelta = toRadians(to.lng - from.lng)
  const halfChord =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(toRadians(from.lat)) * Math.cos(toRadians(to.lat)) * Math.sin(longitudeDelta / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(halfChord))
}

const sortByDistanceFromImplementation = <T>(
  items: readonly T[],
  origin: SortByDistanceFromPoint,
  location: (item: T) => SortByDistanceFromPoint,
): readonly SortByDistanceFromEntry<T>[] =>
  R.pipe(
    items,
    R.map((item) => ({ item, distanceKm: haversineKm(origin, location(item)) })),
    R.sort(ascending((entry: SortByDistanceFromEntry<T>) => entry.distanceKm)),
  )
