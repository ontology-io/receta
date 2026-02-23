# Function: filterKeys()

## Call Signature

> **filterKeys**\<`T`\>(`obj`, `predicate`): `Partial`\<`T`\>

Defined in: [object/filterKeys/index.ts:49](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/object/filterKeys/index.ts#L49)

Filters an object by keeping only keys that match a predicate.

Creates a new object containing only entries whose keys satisfy the predicate.
Useful for filtering by key patterns, removing prefixed keys, or selective
property inclusion based on key names.

### Type Parameters

#### T

`T` *extends* [`PlainObject`](../../types/type-aliases/PlainObject.md)

### Parameters

#### obj

`T`

The object to filter

#### predicate

(`key`) => `boolean`

Function that tests each key

### Returns

`Partial`\<`T`\>

A new object with filtered keys

### Example

```typescript
// Data-first
const config = {
  api_key: 'secret',
  api_url: 'https://api.example.com',
  db_host: 'localhost',
  db_port: 5432
}
filterKeys(config, (key) => key.startsWith('api_'))
// => { api_key: 'secret', api_url: 'https://api.example.com' }

// Remove private keys
filterKeys(obj, (key) => !key.startsWith('_'))

// Keep only specific patterns
filterKeys(data, (key) => /^[a-z]+$/.test(key))

// Data-last (in pipe)
pipe(
  config,
  filterKeys((key) => !key.includes('secret'))
)
```

### See

 - filterValues - for filtering by values instead of keys
 - mask - for allowlist-based filtering with security focus

## Call Signature

> **filterKeys**(`predicate`): \<`T`\>(`obj`) => `Partial`\<`T`\>

Defined in: [object/filterKeys/index.ts:53](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/object/filterKeys/index.ts#L53)

Filters an object by keeping only keys that match a predicate.

Creates a new object containing only entries whose keys satisfy the predicate.
Useful for filtering by key patterns, removing prefixed keys, or selective
property inclusion based on key names.

### Parameters

#### predicate

(`key`) => `boolean`

Function that tests each key

### Returns

A new object with filtered keys

> \<`T`\>(`obj`): `Partial`\<`T`\>

#### Type Parameters

##### T

`T` *extends* [`PlainObject`](../../types/type-aliases/PlainObject.md)

#### Parameters

##### obj

`T`

#### Returns

`Partial`\<`T`\>

### Example

```typescript
// Data-first
const config = {
  api_key: 'secret',
  api_url: 'https://api.example.com',
  db_host: 'localhost',
  db_port: 5432
}
filterKeys(config, (key) => key.startsWith('api_'))
// => { api_key: 'secret', api_url: 'https://api.example.com' }

// Remove private keys
filterKeys(obj, (key) => !key.startsWith('_'))

// Keep only specific patterns
filterKeys(data, (key) => /^[a-z]+$/.test(key))

// Data-last (in pipe)
pipe(
  config,
  filterKeys((key) => !key.includes('secret'))
)
```

### See

 - filterValues - for filtering by values instead of keys
 - mask - for allowlist-based filtering with security focus
