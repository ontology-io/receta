# Function: flatten()

## Call Signature

> **flatten**(`obj`, `options?`): [`FlatObject`](../../types/type-aliases/FlatObject.md)

Defined in: [object/flatten/index.ts:45](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/object/flatten/index.ts#L45)

Flattens a nested object into a single-level object with dot-notation keys.

Converts nested structures like `{ user: { name: 'Alice' } }` into
`{ 'user.name': 'Alice' }`. Useful for form data, query parameters,
and database operations.

### Parameters

#### obj

[`PlainObject`](../../types/type-aliases/PlainObject.md)

The object to flatten

#### options?

[`FlattenOptions`](../../types/interfaces/FlattenOptions.md)

Flattening options (separator, maxDepth, flattenArrays)

### Returns

[`FlatObject`](../../types/type-aliases/FlatObject.md)

A flattened object with dot-notation keys

### Example

```typescript
// Data-first
const nested = { user: { name: 'Alice', age: 30 } }
flatten(nested)
// => { 'user.name': 'Alice', 'user.age': 30 }

// Custom separator
flatten(nested, { separator: '_' })
// => { 'user_name': 'Alice', 'user_age': 30 }

// Max depth
flatten({ a: { b: { c: 1 } } }, { maxDepth: 1 })
// => { 'a.b': { c: 1 } }

// Data-last (in pipe)
pipe(
  nested,
  flatten({ separator: '_' })
)
```

### See

unflatten - for reversing the flattening

## Call Signature

> **flatten**(`options?`): (`obj`) => [`FlatObject`](../../types/type-aliases/FlatObject.md)

Defined in: [object/flatten/index.ts:46](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/object/flatten/index.ts#L46)

Flattens a nested object into a single-level object with dot-notation keys.

Converts nested structures like `{ user: { name: 'Alice' } }` into
`{ 'user.name': 'Alice' }`. Useful for form data, query parameters,
and database operations.

### Parameters

#### options?

[`FlattenOptions`](../../types/interfaces/FlattenOptions.md)

Flattening options (separator, maxDepth, flattenArrays)

### Returns

A flattened object with dot-notation keys

> (`obj`): [`FlatObject`](../../types/type-aliases/FlatObject.md)

#### Parameters

##### obj

[`PlainObject`](../../types/type-aliases/PlainObject.md)

#### Returns

[`FlatObject`](../../types/type-aliases/FlatObject.md)

### Example

```typescript
// Data-first
const nested = { user: { name: 'Alice', age: 30 } }
flatten(nested)
// => { 'user.name': 'Alice', 'user.age': 30 }

// Custom separator
flatten(nested, { separator: '_' })
// => { 'user_name': 'Alice', 'user_age': 30 }

// Max depth
flatten({ a: { b: { c: 1 } } }, { maxDepth: 1 })
// => { 'a.b': { c: 1 } }

// Data-last (in pipe)
pipe(
  nested,
  flatten({ separator: '_' })
)
```

### See

unflatten - for reversing the flattening
