import * as R from 'remeda'
import { validateShape, type ObjectError, type ObjectSchema, type PlainObject } from '@ontologyio/receta/object'
import { isNotEmpty } from '@ontologyio/receta/predicate'
import { err, flatMap, mapErr, ok, type Result } from '@ontologyio/receta/result'

export type CheckExactShapeError = {
  readonly code: 'NOT_AN_OBJECT' | 'INVALID_FIELD' | 'UNKNOWN_FIELDS'
  /** The failing field, every unknown field, or none when the input itself is not an object. */
  readonly paths: readonly string[]
  readonly message: string
}

const describe = ({ path = [] }: ObjectError): CheckExactShapeError => {
  if (R.isEmpty(path)) return { code: 'NOT_AN_OBJECT', paths: [], message: 'Expected an object' }
  const dotted = R.join(path, '.')
  return { code: 'INVALID_FIELD', paths: [dotted], message: `"${dotted}" is missing or has the wrong type` }
}

/** Dot paths of keys the schema doesn't name, looking inside nested schemas too. */
const unknownPaths = (value: unknown, schema: object, prefix: string): readonly string[] => {
  if (!R.isPlainObject(value)) return []
  return R.flatMap(R.keys(value), (key) => {
    const path = prefix === '' ? key : `${prefix}.${key}`
    if (!Object.hasOwn(schema, key)) return [path]
    const rule: unknown = (schema as Record<string, unknown>)[key]
    return R.isPlainObject(rule) ? unknownPaths(value[key], rule, path) : []
  })
}

const rejectUnknownFields =
  <T extends PlainObject>(schema: ObjectSchema<T>) =>
  (value: T): Result<T, CheckExactShapeError> => {
    const unknown = unknownPaths(value, schema, '')
    if (isNotEmpty(unknown)) {
      return err({ code: 'UNKNOWN_FIELDS', paths: unknown, message: `Unknown fields: ${R.join(unknown, ', ')}` })
    }
    return ok(value)
  }

/**
 * Checks an unknown value against a schema of type guards and refuses any key the schema doesn't name.
 *
 * Use when: reading a config file, a feature-flag payload or a strict API request where a
 * misspelled or unexpected key (`timout`, `isAdmin`) is a mistake to report, not something to
 * ignore. Field types are checked first, stopping at the first failure. Then every key the
 * schema doesn't name, at any depth with a nested schema, comes back at once as
 * `UNKNOWN_FIELDS`. A field with a type guard is not looked inside.
 *
 * @example
 * ```ts
 * import { isBoolean, isNumber } from '@ontologyio/receta/predicate'
 *
 * const schema = { timeout: isNumber, retry: { attempts: isNumber, jitter: isBoolean } }
 *
 * checkExactShape({ timeout: 30, retry: { attempts: 3, jitter: true } }, schema)
 * // => Ok({ timeout: 30, retry: { attempts: 3, jitter: true } })
 *
 * checkExactShape({ timeout: 30, timout: 60, retry: { attempts: 3, jitter: true, backof: 2 } }, schema)
 * // => Err({ code: 'UNKNOWN_FIELDS', paths: ['timout', 'retry.backof'], message: 'Unknown fields: timout, retry.backof' })
 *
 * R.pipe({ timeout: '30', retry: {} }, checkExactShape(schema))
 * // => Err({ code: 'INVALID_FIELD', paths: ['timeout'], message: '"timeout" is missing or has the wrong type' })
 * ```
 *
 * @tags validate, strict, exact, schema, unknown keys, typo, config, json, additional properties
 * @see checkShape - the same check that lets unknown keys through
 * @see validateShape - @ontologyio/receta/object, the field check underneath
 */
export function checkExactShape<T extends PlainObject>(
  input: unknown,
  schema: ObjectSchema<T>,
): Result<T, CheckExactShapeError>
export function checkExactShape<T extends PlainObject>(
  schema: ObjectSchema<T>,
): (input: unknown) => Result<T, CheckExactShapeError>
export function checkExactShape(...args: unknown[]): unknown {
  return R.purry(checkExactShapeImplementation, args)
}

const checkExactShapeImplementation = <T extends PlainObject>(
  input: unknown,
  schema: ObjectSchema<T>,
): Result<T, CheckExactShapeError> =>
  R.pipe(validateShape(input, schema), mapErr(describe), flatMap(rejectUnknownFields(schema)))
