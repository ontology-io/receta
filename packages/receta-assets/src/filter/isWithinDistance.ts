import { by, lte, type Predicate } from '@ontologyio/receta/predicate'

export type IsWithinDistancePoint = {
  /** Latitude in degrees, -90 to 90. */
  readonly lat: number
  /** Longitude in degrees, -180 to 180. */
  readonly lng: number
}

const EARTH_RADIUS_KM = 6371
const radians = (degrees: number): number => (degrees * Math.PI) / 180

/** Great-circle distance by the haversine formula, good to about 0.5% anywhere on Earth. */
const distanceKm = (from: IsWithinDistancePoint) => (to: IsWithinDistancePoint): number => {
  const dLat = radians(to.lat - from.lat)
  const dLng = radians(to.lng - from.lng)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(radians(from.lat)) * Math.cos(radians(to.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a))
}

/**
 * Builds a predicate that keeps points within a radius of a center, measured along the Earth's surface.
 *
 * Use when: a store locator, delivery-area check or "near me" list must keep places within so
 * many kilometres of a person. Distance is the great-circle distance, so it is right across the
 * date line and near the poles, but it is as the crow flies, not by road. The edge counts as
 * inside. For points nested in an object, wrap it with `by`.
 *
 * @example
 * ```ts
 * import { by } from '@ontologyio/receta/predicate'
 *
 * const london = { lat: 51.5074, lng: -0.1278 }
 * const stores = [
 *   { name: 'Camden', at: { lat: 51.539, lng: -0.1426 } },
 *   { name: 'Oxford', at: { lat: 51.752, lng: -1.2577 } },
 *   { name: 'Paris', at: { lat: 48.8566, lng: 2.3522 } },
 * ]
 *
 * R.map(R.filter(stores, by((store) => store.at, isWithinDistance(london, 10))), R.prop('name'))
 * // => ['Camden']
 *
 * R.map(R.filter(stores, by((store) => store.at, isWithinDistance(london, 100))), R.prop('name'))
 * // => ['Camden', 'Oxford']
 * ```
 *
 * @tags distance, radius, nearby, near me, geo, location, haversine, store locator, km
 * @see isInBoundingBox - points inside a map's visible rectangle
 */
export function isWithinDistance(center: IsWithinDistancePoint, radiusKm: number): Predicate<IsWithinDistancePoint> {
  return by(distanceKm(center), lte(radiusKm))
}
