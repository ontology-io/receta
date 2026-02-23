# Function: setPath()

## Call Signature

> **setPath**\<`T`\>(`path`, `value`, `obj`): `T`

Defined in: [object/setPath/index.ts:48](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/object/setPath/index.ts#L48)

Immutably sets a value at a given path in an object.

Creates a new object with the value at the specified path updated.
Creates intermediate objects/arrays as needed. Returns a shallow copy
with only the path modified.

### Type Parameters

#### T

`T` *extends* [`PlainObject`](../../types/type-aliases/PlainObject.md)

### Parameters

#### path

[`ObjectPath`](../../types/type-aliases/ObjectPath.md)

The path where to set the value

#### value

`unknown`

The value to set

#### obj

`T`

The object to update

### Returns

`T`

A new object with the value set at the path

### Example

```typescript
// Data-first
const config = { database: { host: 'localhost' } }
setPath(['database', 'port'], 5432, config)
// => { database: { host: 'localhost', port: 5432 } }

// Creating intermediate paths
setPath(['api', 'endpoints', 'users'], '/api/v1/users', {})
// => { api: { endpoints: { users: '/api/v1/users' } } }

// Array indices
setPath(['items', 1], 'updated', { items: ['a', 'b'] })
// => { items: ['a', 'updated'] }

// Data-last (in pipe)
pipe(
  config,
  setPath(['database', 'host'], 'prod.example.com'),
  setPath(['database', 'port'], 5432)
)
```

### See

 - getPath - for safely reading a value at a path
 - updatePath - for updating with a function

## Call Signature

> **setPath**(`path`, `value`): \<`T`\>(`obj`) => `T`

Defined in: [object/setPath/index.ts:49](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/object/setPath/index.ts#L49)

Immutably sets a value at a given path in an object.

Creates a new object with the value at the specified path updated.
Creates intermediate objects/arrays as needed. Returns a shallow copy
with only the path modified.

### Parameters

#### path

[`ObjectPath`](../../types/type-aliases/ObjectPath.md)

The path where to set the value

#### value

`unknown`

The value to set

### Returns

A new object with the value set at the path

> \<`T`\>(`obj`): `T`

#### Type Parameters

##### T

`T` *extends* [`PlainObject`](../../types/type-aliases/PlainObject.md)

#### Parameters

##### obj

`T`

#### Returns

`T`

### Example

```typescript
// Data-first
const config = { database: { host: 'localhost' } }
setPath(['database', 'port'], 5432, config)
// => { database: { host: 'localhost', port: 5432 } }

// Creating intermediate paths
setPath(['api', 'endpoints', 'users'], '/api/v1/users', {})
// => { api: { endpoints: { users: '/api/v1/users' } } }

// Array indices
setPath(['items', 1], 'updated', { items: ['a', 'b'] })
// => { items: ['a', 'updated'] }

// Data-last (in pipe)
pipe(
  config,
  setPath(['database', 'host'], 'prod.example.com'),
  setPath(['database', 'port'], 5432)
)
```

### See

 - getPath - for safely reading a value at a path
 - updatePath - for updating with a function
