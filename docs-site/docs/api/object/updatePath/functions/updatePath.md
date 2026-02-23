# Function: updatePath()

## Call Signature

> **updatePath**\<`T`, `V`\>(`path`, `fn`, `obj`): `T`

Defined in: [object/updatePath/index.ts:51](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/object/updatePath/index.ts#L51)

Immutably updates a value at a given path using a function.

Retrieves the current value at the path, applies the update function,
and sets the new value. If the path doesn't exist, the object is returned
unchanged.

### Type Parameters

#### T

`T` *extends* [`PlainObject`](../../types/type-aliases/PlainObject.md)

#### V

`V`

### Parameters

#### path

[`ObjectPath`](../../types/type-aliases/ObjectPath.md)

The path to the value to update

#### fn

(`value`) => `V`

Function to transform the current value

#### obj

`T`

The object to update

### Returns

`T`

A new object with the updated value, or the original if path not found

### Example

```typescript
// Data-first
const user = { profile: { views: 10 } }
updatePath(['profile', 'views'], (n: number) => n + 1, user)
// => { profile: { views: 11 } }

// Path doesn't exist - returns original
updatePath(['profile', 'likes'], (n: number) => n + 1, user)
// => { profile: { views: 10 } }

// Transforming nested data
updatePath(['database', 'host'], (host: string) => host.toUpperCase(), config)

// Data-last (in pipe)
pipe(
  user,
  updatePath(['profile', 'views'], (n: number) => n + 1),
  updatePath(['profile', 'lastSeen'], () => new Date())
)
```

### See

 - getPath - for reading a value at a path
 - setPath - for setting a value directly

## Call Signature

> **updatePath**\<`V`\>(`path`, `fn`): \<`T`\>(`obj`) => `T`

Defined in: [object/updatePath/index.ts:56](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/object/updatePath/index.ts#L56)

Immutably updates a value at a given path using a function.

Retrieves the current value at the path, applies the update function,
and sets the new value. If the path doesn't exist, the object is returned
unchanged.

### Type Parameters

#### V

`V`

### Parameters

#### path

[`ObjectPath`](../../types/type-aliases/ObjectPath.md)

The path to the value to update

#### fn

(`value`) => `V`

Function to transform the current value

### Returns

A new object with the updated value, or the original if path not found

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
const user = { profile: { views: 10 } }
updatePath(['profile', 'views'], (n: number) => n + 1, user)
// => { profile: { views: 11 } }

// Path doesn't exist - returns original
updatePath(['profile', 'likes'], (n: number) => n + 1, user)
// => { profile: { views: 10 } }

// Transforming nested data
updatePath(['database', 'host'], (host: string) => host.toUpperCase(), config)

// Data-last (in pipe)
pipe(
  user,
  updatePath(['profile', 'views'], (n: number) => n + 1),
  updatePath(['profile', 'lastSeen'], () => new Date())
)
```

### See

 - getPath - for reading a value at a path
 - setPath - for setting a value directly
