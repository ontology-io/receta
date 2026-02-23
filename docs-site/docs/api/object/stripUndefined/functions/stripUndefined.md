# Function: stripUndefined()

> **stripUndefined**\<`T`\>(`obj`): `Partial`\<`T`\>

Defined in: [object/stripUndefined/index.ts:46](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/object/stripUndefined/index.ts#L46)

Removes all undefined values from an object (shallow).

Creates a new object without properties that have undefined values.
Useful for cleaning up data before sending to APIs, preventing
prototype pollution, and preparing data for serialization.

Note: This is a shallow operation. Use with `mapValues` for deep cleaning.

## Type Parameters

### T

`T` *extends* [`PlainObject`](../../types/type-aliases/PlainObject.md)

## Parameters

### obj

`T`

The object to clean

## Returns

`Partial`\<`T`\>

A new object without undefined values

## Example

```typescript
// Data-first
const input = { name: 'Alice', age: undefined, email: 'alice@example.com' }
stripUndefined(input)
// => { name: 'Alice', email: 'alice@example.com' }

// Preparing API payload
const payload = stripUndefined({
  name: formData.name,
  email: formData.email,
  phone: formData.phone // might be undefined
})

// Data-last (in pipe)
pipe(
  formData,
  stripUndefined,
  validateShape(schema)
)
```

## See

compact - for removing both null and undefined
