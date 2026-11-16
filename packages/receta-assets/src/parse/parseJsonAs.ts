import * as R from 'remeda'
import { validateShape, type ObjectSchema, type PlainObject } from '@ontologyio/receta/object'
import { flatMap, mapErr, parseJSON, type Result } from '@ontologyio/receta/result'

export type ParseJsonAsError = {
  readonly code: 'INVALID_JSON' | 'INVALID_SHAPE'
  readonly input: string
  /** Where the shape broke, like `['user', 'age']`; empty for broken JSON or a non-object. */
  readonly path: readonly (string | number)[]
  readonly message: string
}

/**
 * Parses JSON text and checks it against a schema of type guards, returning a typed object or the first field that's wrong.
 *
 * Use when: JSON from outside the program, such as a request body, a queue message, a file
 * or `localStorage`, has to become a typed value without a cast. The schema maps each field
 * to a guard such as `isString` or `isNumber`, or to a nested schema; fields not in the
 * schema are kept as they are. The error says which path failed, so it can go straight into
 * a 400 response or a log line.
 *
 * @example
 * ```ts
 * import { isNumber, isString } from '@ontologyio/receta/predicate'
 *
 * const userSchema = { name: isString, address: { city: isString, zip: isNumber } }
 *
 * parseJsonAs('{"name":"Ada","address":{"city":"London","zip":1}}', userSchema)
 * // => Ok({ name: 'Ada', address: { city: 'London', zip: 1 } })
 *
 * R.pipe('{"name":"Ada","address":{"city":"London","zip":"N1"}}', parseJsonAs(userSchema))
 * // => Err({ code: 'INVALID_SHAPE', input: '{"name":"Ada","address":{"city":"London","zip":"N1"}}', path: ['address', 'zip'], message: 'Field "address.zip" is missing or has the wrong type' })
 *
 * parseJsonAs('[]', userSchema)
 * // => Err({ code: 'INVALID_SHAPE', input: '[]', path: [], message: 'Expected a JSON object' })
 * ```
 *
 * @tags json, schema, typed, decode, payload, body, guard, shape, validate
 * @see parseJsonObject - only checks that the JSON is an object
 * @see validateShape - @ontologyio/receta/object, the schema check underneath
 */
export function parseJsonAs<T extends PlainObject>(
  input: string,
  schema: ObjectSchema<T>,
): Result<T, ParseJsonAsError>
export function parseJsonAs<T extends PlainObject>(
  schema: ObjectSchema<T>,
): (input: string) => Result<T, ParseJsonAsError>
export function parseJsonAs(...args: unknown[]): unknown {
  return R.purry(parseJsonAsImplementation, args)
}

const parseJsonAsImplementation = <T extends PlainObject>(
  input: string,
  schema: ObjectSchema<T>,
): Result<T, ParseJsonAsError> =>
  R.pipe(
    parseJSON<unknown>(input),
    mapErr((error): ParseJsonAsError => ({
      code: 'INVALID_JSON',
      input,
      path: [],
      message: `Not valid JSON: ${error.message}`,
    })),
    flatMap((value) =>
      R.pipe(
        validateShape(value, schema),
        mapErr(({ path = [] }): ParseJsonAsError => ({
          code: 'INVALID_SHAPE',
          input,
          path,
          message: R.isEmpty(path)
            ? 'Expected a JSON object'
            : `Field "${R.join(path, '.')}" is missing or has the wrong type`,
        })),
      ),
    ),
  )
