import * as R from 'remeda'
import { getPath, validateShape, type ObjectError, type ObjectSchema, type PlainObject } from '@ontologyio/receta/object'
import { unwrapOr } from '@ontologyio/receta/option'
import { mapErr, type Result } from '@ontologyio/receta/result'

export type CheckShapeError = {
  readonly code: 'NOT_AN_OBJECT' | 'INVALID_FIELD'
  /** Dot path of the field that failed, `''` when the input itself is not an object. */
  readonly path: string
  /** What was found at that path. */
  readonly value: unknown
  readonly message: string
}

const describe = (input: unknown, { path = [] }: ObjectError): CheckShapeError => {
  if (R.isEmpty(path)) return { code: 'NOT_AN_OBJECT', path: '', value: input, message: 'Expected an object' }
  const dotted = R.join(path, '.')
  const value = unwrapOr(getPath(path, input as PlainObject), undefined as unknown)
  return { code: 'INVALID_FIELD', path: dotted, value, message: `"${dotted}" is missing or has the wrong type` }
}

/**
 * Checks that an unknown value is an object whose fields pass the schema's type guards, and types it.
 *
 * Use when: trusting parsed JSON, a message from a queue, `localStorage` or a webhook body
 * enough to use its fields, without a validation library. The schema maps each key to a type
 * guard such as `isString`, or to a nested schema. It stops at the first field that fails and
 * returns `Err` with its dot path, the value found there and a readable message. Keys the
 * schema doesn't mention are allowed and kept.
 *
 * @example
 * ```ts
 * import { isNumber, isString } from '@ontologyio/receta/predicate'
 *
 * const schema = { id: isString, total: isNumber, address: { city: isString } }
 *
 * checkShape({ id: 'o1', total: 12, address: { city: 'Oslo' }, note: 'gift' }, schema)
 * // => Ok({ id: 'o1', total: 12, address: { city: 'Oslo' }, note: 'gift' })
 *
 * checkShape({ id: 'o1', total: 12, address: { city: 7 } }, schema)
 * // => Err({ code: 'INVALID_FIELD', path: 'address.city', value: 7, message: '"address.city" is missing or has the wrong type' })
 *
 * checkShape({ id: 'o1', address: { city: 'Oslo' } }, schema)
 * // => Err({ code: 'INVALID_FIELD', path: 'total', value: undefined, message: '"total" is missing or has the wrong type' })
 *
 * R.pipe('not json object', checkShape(schema))
 * // => Err({ code: 'NOT_AN_OBJECT', path: '', value: 'not json object', message: 'Expected an object' })
 * ```
 *
 * @tags validate, shape, schema, json, type guard, unknown, parse, webhook, payload, narrow
 * @see checkExactShape - also refuses keys the schema doesn't name
 * @see validateShape - @ontologyio/receta/object, the check underneath, with a key-list path
 */
export function checkShape<T extends PlainObject>(input: unknown, schema: ObjectSchema<T>): Result<T, CheckShapeError>
export function checkShape<T extends PlainObject>(schema: ObjectSchema<T>): (input: unknown) => Result<T, CheckShapeError>
export function checkShape(...args: unknown[]): unknown {
  return R.purry(checkShapeImplementation, args)
}

const checkShapeImplementation = <T extends PlainObject>(
  input: unknown,
  schema: ObjectSchema<T>,
): Result<T, CheckShapeError> =>
  R.pipe(
    validateShape(input, schema),
    mapErr((error) => describe(input, error)),
  )
