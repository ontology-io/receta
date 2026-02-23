# Function: rename()

## Call Signature

> **rename**\<`T`\>(`obj`, `mapping`): [`PlainObject`](../../types/type-aliases/PlainObject.md)

Defined in: [object/rename/index.ts:41](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/object/rename/index.ts#L41)

Renames keys in an object according to a mapping.

Creates a new object with renamed keys. If a key isn't in the mapping,
it's kept as-is. Useful for transforming API responses, normalizing data,
and adapting to different schemas.

### Type Parameters

#### T

`T` *extends* [`PlainObject`](../../types/type-aliases/PlainObject.md)

### Parameters

#### obj

`T`

The object with keys to rename

#### mapping

`Record`\<`string`, `string`\>

Object mapping old keys to new keys

### Returns

[`PlainObject`](../../types/type-aliases/PlainObject.md)

A new object with renamed keys

### Example

```typescript
// Data-first
const user = { firstName: 'Alice', lastName: 'Smith' }
rename(user, { firstName: 'given_name', lastName: 'family_name' })
// => { given_name: 'Alice', family_name: 'Smith' }

// Partial mapping (unmapped keys preserved)
rename({ id: 1, name: 'Alice', age: 30 }, { name: 'fullName' })
// => { id: 1, fullName: 'Alice', age: 30 }

// Data-last (in pipe)
pipe(
  apiResponse,
  rename({ user_id: 'userId', created_at: 'createdAt' })
)
```

### See

mapKeys - for transforming all keys with a function

## Call Signature

> **rename**(`mapping`): \<`T`\>(`obj`) => [`PlainObject`](../../types/type-aliases/PlainObject.md)

Defined in: [object/rename/index.ts:42](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/object/rename/index.ts#L42)

Renames keys in an object according to a mapping.

Creates a new object with renamed keys. If a key isn't in the mapping,
it's kept as-is. Useful for transforming API responses, normalizing data,
and adapting to different schemas.

### Parameters

#### mapping

`Record`\<`string`, `string`\>

Object mapping old keys to new keys

### Returns

A new object with renamed keys

> \<`T`\>(`obj`): [`PlainObject`](../../types/type-aliases/PlainObject.md)

#### Type Parameters

##### T

`T` *extends* [`PlainObject`](../../types/type-aliases/PlainObject.md)

#### Parameters

##### obj

`T`

#### Returns

[`PlainObject`](../../types/type-aliases/PlainObject.md)

### Example

```typescript
// Data-first
const user = { firstName: 'Alice', lastName: 'Smith' }
rename(user, { firstName: 'given_name', lastName: 'family_name' })
// => { given_name: 'Alice', family_name: 'Smith' }

// Partial mapping (unmapped keys preserved)
rename({ id: 1, name: 'Alice', age: 30 }, { name: 'fullName' })
// => { id: 1, fullName: 'Alice', age: 30 }

// Data-last (in pipe)
pipe(
  apiResponse,
  rename({ user_id: 'userId', created_at: 'createdAt' })
)
```

### See

mapKeys - for transforming all keys with a function
