# Function: unflatten()

## Call Signature

> **unflatten**(`obj`, `options?`): [`PlainObject`](../../types/type-aliases/PlainObject.md)

Defined in: [object/unflatten/index.ts:44](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/object/unflatten/index.ts#L44)

Unflattens a single-level object with dot-notation keys into a nested object.

Reverses the flattening operation, converting `{ 'user.name': 'Alice' }`
back into `{ user: { name: 'Alice' } }`.

### Parameters

#### obj

[`FlatObject`](../../types/type-aliases/FlatObject.md)

The flattened object to unflatten

#### options?

[`UnflattenOptions`](../../types/interfaces/UnflattenOptions.md)

Unflattening options (separator)

### Returns

[`PlainObject`](../../types/type-aliases/PlainObject.md)

A nested object

### Example

```typescript
// Data-first
const flat = { 'user.name': 'Alice', 'user.age': 30 }
unflatten(flat)
// => { user: { name: 'Alice', age: 30 } }

// Custom separator
unflatten({ 'user_name': 'Alice' }, { separator: '_' })
// => { user: { name: 'Alice' } }

// Array indices
unflatten({ 'items.0': 'a', 'items.1': 'b' })
// => { items: ['a', 'b'] }

// Data-last (in pipe)
pipe(
  flat,
  unflatten({ separator: '_' })
)
```

### See

flatten - for the reverse operation

## Call Signature

> **unflatten**(`options?`): (`obj`) => [`PlainObject`](../../types/type-aliases/PlainObject.md)

Defined in: [object/unflatten/index.ts:45](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/object/unflatten/index.ts#L45)

Unflattens a single-level object with dot-notation keys into a nested object.

Reverses the flattening operation, converting `{ 'user.name': 'Alice' }`
back into `{ user: { name: 'Alice' } }`.

### Parameters

#### options?

[`UnflattenOptions`](../../types/interfaces/UnflattenOptions.md)

Unflattening options (separator)

### Returns

A nested object

> (`obj`): [`PlainObject`](../../types/type-aliases/PlainObject.md)

#### Parameters

##### obj

[`FlatObject`](../../types/type-aliases/FlatObject.md)

#### Returns

[`PlainObject`](../../types/type-aliases/PlainObject.md)

### Example

```typescript
// Data-first
const flat = { 'user.name': 'Alice', 'user.age': 30 }
unflatten(flat)
// => { user: { name: 'Alice', age: 30 } }

// Custom separator
unflatten({ 'user_name': 'Alice' }, { separator: '_' })
// => { user: { name: 'Alice' } }

// Array indices
unflatten({ 'items.0': 'a', 'items.1': 'b' })
// => { items: ['a', 'b'] }

// Data-last (in pipe)
pipe(
  flat,
  unflatten({ separator: '_' })
)
```

### See

flatten - for the reverse operation
