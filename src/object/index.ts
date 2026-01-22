/**
 * Object module - Safe, composable object manipulation utilities.
 *
 * Provides utilities for flattening, transforming, validating, and safely
 * accessing nested object structures. All operations are immutable and
 * integrate with Result/Option patterns for type-safe error handling.
 *
 * @module object
 *
 * @example
 * ```typescript
 * import * as Obj from 'receta/object'
 * import { pipe } from 'remeda'
 *
 * // Flatten and transform
 * const flat = Obj.flatten({ user: { name: 'Alice' } })
 * // => { 'user.name': 'Alice' }
 *
 * // Safe nested access
 * const host = Obj.getPath(config, ['database', 'host'])
 * // => Option<string>
 *
 * // Validation
 * const result = Obj.validateShape(input, schema)
 * // => Result<User, ObjectError>
 * ```
 */

// Types
export type {
  ObjectPath,
  DeepPartial,
  FlatObject,
  FlattenOptions,
  UnflattenOptions,
  DeepMergeOptions,
  ObjectError,
  PlainObject,
  KeysOfType,
  PathValue,
} from './types'

export type { ObjectSchema } from './validateShape'

// Core operations
export { flatten } from './flatten'
export { unflatten } from './unflatten'
export { rename } from './rename'
export { mask } from './mask'
export { deepMerge } from './deepMerge'

// Safe access
export { getPath } from './getPath'
export { setPath } from './setPath'
export { updatePath } from './updatePath'

// Validation
export { validateShape } from './validateShape'
export { stripUndefined } from './stripUndefined'
export { compact } from './compact'

// Transformation
export { mapKeys } from './mapKeys'
export { mapValues } from './mapValues'
export { filterKeys } from './filterKeys'
export { filterValues } from './filterValues'
