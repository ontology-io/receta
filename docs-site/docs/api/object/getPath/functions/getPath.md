# Function: getPath()

## Call Signature

> **getPath**\<`T`\>(`path`, `obj`): [`Option`](../../../option/types/type-aliases/Option.md)\<`T`\>

Defined in: [object/getPath/index.ts:53](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/object/getPath/index.ts#L53)

Safely gets a value at a given path in an object, returning Option.

Navigates nested object structures using a path (array of keys).
Returns Some(value) if the path exists, None if any part is undefined/null.
Safer than optional chaining as it composes with other Option operations.

### Type Parameters

#### T

`T` = `unknown`

### Parameters

#### path

[`ObjectPath`](../../types/type-aliases/ObjectPath.md)

The path to follow (array of keys)

#### obj

[`PlainObject`](../../types/type-aliases/PlainObject.md)

The object to navigate

### Returns

[`Option`](../../../option/types/type-aliases/Option.md)\<`T`\>

Option<T> - Some(value) if found, None otherwise

### Example

```typescript
// Data-first
const config = { database: { host: 'localhost', port: 5432 } }
getPath(['database', 'host'], config)
// => Some('localhost')

getPath(['database', 'user'], config)
// => None

getPath(['api', 'key'], config)
// => None (intermediate path doesn't exist)

// Composing with Option
pipe(
  getPath(['database', 'host'], config),
  map(host => `postgres://${host}`),
  unwrapOr('postgres://localhost')
)

// Data-last (in pipe)
pipe(
  config,
  getPath(['database', 'port'])
)
```

### See

 - setPath - for immutably setting a value at a path
 - updatePath - for updating a value at a path with a function

## Call Signature

> **getPath**\<`T`\>(`path`): (`obj`) => [`Option`](../../../option/types/type-aliases/Option.md)\<`T`\>

Defined in: [object/getPath/index.ts:54](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/object/getPath/index.ts#L54)

Safely gets a value at a given path in an object, returning Option.

Navigates nested object structures using a path (array of keys).
Returns Some(value) if the path exists, None if any part is undefined/null.
Safer than optional chaining as it composes with other Option operations.

### Type Parameters

#### T

`T` = `unknown`

### Parameters

#### path

[`ObjectPath`](../../types/type-aliases/ObjectPath.md)

The path to follow (array of keys)

### Returns

Option<T> - Some(value) if found, None otherwise

> (`obj`): [`Option`](../../../option/types/type-aliases/Option.md)\<`T`\>

#### Parameters

##### obj

[`PlainObject`](../../types/type-aliases/PlainObject.md)

#### Returns

[`Option`](../../../option/types/type-aliases/Option.md)\<`T`\>

### Example

```typescript
// Data-first
const config = { database: { host: 'localhost', port: 5432 } }
getPath(['database', 'host'], config)
// => Some('localhost')

getPath(['database', 'user'], config)
// => None

getPath(['api', 'key'], config)
// => None (intermediate path doesn't exist)

// Composing with Option
pipe(
  getPath(['database', 'host'], config),
  map(host => `postgres://${host}`),
  unwrapOr('postgres://localhost')
)

// Data-last (in pipe)
pipe(
  config,
  getPath(['database', 'port'])
)
```

### See

 - setPath - for immutably setting a value at a path
 - updatePath - for updating a value at a path with a function
