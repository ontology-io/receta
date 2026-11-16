import * as R from 'remeda'
import { between } from '@ontologyio/receta/predicate'
import { err, flatMap, fromNullable, map, ok, type Result } from '@ontologyio/receta/result'

export type ParseCoordinatesError = {
  readonly code: 'NOT_A_PAIR' | 'LATITUDE_OUT_OF_RANGE' | 'LONGITUDE_OUT_OF_RANGE'
  readonly input: string
  readonly message: string
}

export type ParseCoordinatesPoint = {
  /** Degrees north, from -90 to 90. */
  readonly lat: number
  /** Degrees east, from -180 to 180. */
  readonly lng: number
}

const PAIR = /^\s*(-?\d+(?:\.\d+)?)\s*(?:,\s*|\s+)(-?\d+(?:\.\d+)?)\s*$/
const isLatitude = between(-90, 90)
const isLongitude = between(-180, 180)

/**
 * Parses a `latitude, longitude` pair such as `51.5072, -0.1276` and checks both are on the globe.
 *
 * Use when: a location is pasted from a map app, typed into a form, read from a CSV column or
 * passed as `?near=51.5,-0.12`. The numbers may be separated by a comma, spaces, or both.
 * Latitude comes first, as map apps copy it. A latitude past ±90 usually means the pair was
 * swapped, and gets its own code so the message can say so.
 *
 * @example
 * ```ts
 * parseCoordinates('51.5072, -0.1276')
 * // => Ok({ lat: 51.5072, lng: -0.1276 })
 *
 * parseCoordinates('40.7128 -74.006')
 * // => Ok({ lat: 40.7128, lng: -74.006 })
 *
 * parseCoordinates('-0.1276, 151.5')
 * // => Ok({ lat: -0.1276, lng: 151.5 })
 *
 * parseCoordinates('-122.42, 37.77')
 * // => Err({ code: 'LATITUDE_OUT_OF_RANGE', input: '-122.42, 37.77', message: 'Latitude -122.42 is past ±90; is the pair longitude first?' })
 *
 * parseCoordinates('London')
 * // => Err({ code: 'NOT_A_PAIR', input: 'London', message: 'Expected latitude, longitude such as 51.5, -0.12, got "London"' })
 * ```
 *
 * @tags coordinates, latitude, longitude, lat lng, geo, location, map, gps
 * @see between - @ontologyio/receta/predicate, the range checks
 */
export function parseCoordinates(input: string): Result<ParseCoordinatesPoint, ParseCoordinatesError> {
  return R.pipe(
    fromNullable(PAIR.exec(input), {
      code: 'NOT_A_PAIR',
      input,
      message: `Expected latitude, longitude such as 51.5, -0.12, got "${input}"`,
    } satisfies ParseCoordinatesError),
    map(([, lat = '0', lng = '0']) => ({ lat: Number(lat), lng: Number(lng) })),
    flatMap((point): Result<ParseCoordinatesPoint, ParseCoordinatesError> => {
      if (!isLatitude(point.lat)) {
        return err({
          code: 'LATITUDE_OUT_OF_RANGE',
          input,
          message: `Latitude ${point.lat} is past ±90; is the pair longitude first?`,
        })
      }
      if (!isLongitude(point.lng)) {
        return err({
          code: 'LONGITUDE_OUT_OF_RANGE',
          input,
          message: `Longitude ${point.lng} is past ±180`,
        })
      }
      return ok(point)
    }),
  )
}
