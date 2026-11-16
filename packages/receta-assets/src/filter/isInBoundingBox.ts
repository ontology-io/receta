import { and, between, by, gte, lte, or, type Predicate } from '@ontologyio/receta/predicate'

export type IsInBoundingBoxPoint = {
  readonly lat: number
  readonly lng: number
}

/** A map's visible area, as map libraries report it, in degrees. */
export type IsInBoundingBoxBounds = {
  readonly north: number
  readonly south: number
  readonly east: number
  readonly west: number
}

/**
 * Builds a predicate that keeps points inside a map's visible rectangle, also when it crosses the date line.
 *
 * Use when: a map view shows only the markers or listings in view, refreshed as the person
 * pans and zooms, from bounds such as Mapbox's or Google Maps' `getBounds()`. Edges count as
 * inside. When `west` is greater than `east`, the box crosses the 180° meridian, as over the
 * Pacific, and longitudes on either side of it are kept.
 *
 * @example
 * ```ts
 * const places = [
 *   { name: 'Fiji', lat: -17.7, lng: 178.1 },
 *   { name: 'Samoa', lat: -13.8, lng: -172.1 },
 *   { name: 'Sydney', lat: -33.9, lng: 151.2 },
 * ]
 *
 * R.map(R.filter(places, isInBoundingBox({ north: -10, south: -20, west: 170, east: -170 })), R.prop('name'))
 * // => ['Fiji', 'Samoa']
 *
 * R.map(R.filter(places, isInBoundingBox({ north: -30, south: -40, west: 140, east: 155 })), R.prop('name'))
 * // => ['Sydney']
 * ```
 *
 * @tags map, viewport, bounds, bounding box, bbox, geo, markers, antimeridian, filter
 * @see isWithinDistance - points within a radius instead of a rectangle
 */
export function isInBoundingBox(bounds: IsInBoundingBoxBounds): Predicate<IsInBoundingBoxPoint> {
  const crossesDateLine = bounds.west > bounds.east
  const inLongitude = crossesDateLine ? or(gte(bounds.west), lte(bounds.east)) : between(bounds.west, bounds.east)
  return and(
    by((point: IsInBoundingBoxPoint) => point.lat, between(bounds.south, bounds.north)),
    by((point: IsInBoundingBoxPoint) => point.lng, inLongitude),
  )
}
