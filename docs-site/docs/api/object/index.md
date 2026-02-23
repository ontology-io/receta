# object

Object module - Safe, composable object manipulation utilities.

Provides utilities for flattening, transforming, validating, and safely
accessing nested object structures. All operations are immutable and
integrate with Result/Option patterns for type-safe error handling.

## Example

```typescript
import * as Obj from 'receta/object'
import { pipe } from 'remeda'

// Flatten and transform
const flat = Obj.flatten({ user: { name: 'Alice' } })
// => { 'user.name': 'Alice' }

// Safe nested access
const host = Obj.getPath(config, ['database', 'host'])
// => Option<string>

// Validation
const result = Obj.validateShape(input, schema)
// => Result<User, ObjectError>
```

## References

### compact

Re-exports [compact](compact/functions/compact.md)

***

### deepMerge

Re-exports [deepMerge](deepMerge/functions/deepMerge.md)

***

### DeepMergeOptions

Re-exports [DeepMergeOptions](types/interfaces/DeepMergeOptions.md)

***

### DeepPartial

Re-exports [DeepPartial](types/type-aliases/DeepPartial.md)

***

### filterKeys

Re-exports [filterKeys](filterKeys/functions/filterKeys.md)

***

### filterValues

Re-exports [filterValues](filterValues/functions/filterValues.md)

***

### FlatObject

Re-exports [FlatObject](types/type-aliases/FlatObject.md)

***

### flatten

Re-exports [flatten](flatten/functions/flatten.md)

***

### FlattenOptions

Re-exports [FlattenOptions](types/interfaces/FlattenOptions.md)

***

### getPath

Re-exports [getPath](getPath/functions/getPath.md)

***

### KeysOfType

Re-exports [KeysOfType](types/type-aliases/KeysOfType.md)

***

### KeyTransform

Re-exports [KeyTransform](transformKeys/type-aliases/KeyTransform.md)

***

### mapKeys

Re-exports [mapKeys](mapKeys/functions/mapKeys.md)

***

### mapValues

Re-exports [mapValues](mapValues/functions/mapValues.md)

***

### mask

Re-exports [mask](mask/functions/mask.md)

***

### ObjectError

Re-exports [ObjectError](types/interfaces/ObjectError.md)

***

### ObjectPath

Re-exports [ObjectPath](types/type-aliases/ObjectPath.md)

***

### ObjectSchema

Re-exports [ObjectSchema](validateShape/type-aliases/ObjectSchema.md)

***

### PathValue

Re-exports [PathValue](types/type-aliases/PathValue.md)

***

### PlainObject

Re-exports [PlainObject](types/type-aliases/PlainObject.md)

***

### rename

Re-exports [rename](rename/functions/rename.md)

***

### setPath

Re-exports [setPath](setPath/functions/setPath.md)

***

### stripEmpty

Re-exports [stripEmpty](stripEmpty/functions/stripEmpty.md)

***

### StripEmptyOptions

Re-exports [StripEmptyOptions](stripEmpty/interfaces/StripEmptyOptions.md)

***

### stripUndefined

Re-exports [stripUndefined](stripUndefined/functions/stripUndefined.md)

***

### transformKeys

Re-exports [transformKeys](transformKeys/functions/transformKeys.md)

***

### TransformKeysOptions

Re-exports [TransformKeysOptions](transformKeys/interfaces/TransformKeysOptions.md)

***

### unflatten

Re-exports [unflatten](unflatten/functions/unflatten.md)

***

### UnflattenOptions

Re-exports [UnflattenOptions](types/interfaces/UnflattenOptions.md)

***

### updatePath

Re-exports [updatePath](updatePath/functions/updatePath.md)

***

### validateShape

Re-exports [validateShape](validateShape/functions/validateShape.md)
