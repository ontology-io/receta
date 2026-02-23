# Function: indexByUnique()

## Call Signature

> **indexByUnique**\<`T`, `TKey`\>(`items`, `getKey`, `config?`): [`Result`](../../../result/types/type-aliases/Result.md)\<`Record`\<`TKey`, `T`\>, [`DuplicateKeyError`](../../types/classes/DuplicateKeyError.md)\>

Defined in: [collection/indexByUnique/index.ts:53](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/collection/indexByUnique/index.ts#L53)

Creates an index (map) from an array, ensuring keys are unique.

Returns a Result to handle duplicate key errors safely.
Useful for normalizing data and creating lookup tables.

### Type Parameters

#### T

`T`

#### TKey

`TKey` *extends* `string` \| `number`

### Parameters

#### items

readonly `T`[]

The array of items to index

#### getKey

(`item`) => `TKey`

Function to extract the key from each item

#### config?

[`IndexConfig`](../../types/interfaces/IndexConfig.md)

Configuration for collision handling

### Returns

[`Result`](../../../result/types/type-aliases/Result.md)\<`Record`\<`TKey`, `T`\>, [`DuplicateKeyError`](../../types/classes/DuplicateKeyError.md)\>

Result containing either the index or a DuplicateKeyError

### Example

```typescript
// Data-first
const users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' }
]

indexByUnique(users, (u) => u.id)
// => Ok({ 1: { id: 1, name: 'Alice' }, 2: { id: 2, name: 'Bob' } })

// Duplicate keys
const duplicates = [
  { id: 1, name: 'Alice' },
  { id: 1, name: 'Alicia' }
]

indexByUnique(duplicates, (u) => u.id)
// => Err(DuplicateKeyError: Duplicate key found: 1)

// Handle collisions with config
indexByUnique(duplicates, (u) => u.id, { onCollision: 'last' })
// => Ok({ 1: { id: 1, name: 'Alicia' } }) // keeps last

indexByUnique(duplicates, (u) => u.id, { onCollision: 'first' })
// => Ok({ 1: { id: 1, name: 'Alice' } }) // keeps first

// Data-last (in pipe)
pipe(
  users,
  indexByUnique((u) => u.id)
)
```

### See

nest - for hierarchical grouping

## Call Signature

> **indexByUnique**\<`T`, `TKey`\>(`getKey`, `config?`): (`items`) => [`Result`](../../../result/types/type-aliases/Result.md)\<`Record`\<`TKey`, `T`\>, [`DuplicateKeyError`](../../types/classes/DuplicateKeyError.md)\>

Defined in: [collection/indexByUnique/index.ts:58](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/collection/indexByUnique/index.ts#L58)

Creates an index (map) from an array, ensuring keys are unique.

Returns a Result to handle duplicate key errors safely.
Useful for normalizing data and creating lookup tables.

### Type Parameters

#### T

`T`

#### TKey

`TKey` *extends* `string` \| `number`

### Parameters

#### getKey

(`item`) => `TKey`

Function to extract the key from each item

#### config?

[`IndexConfig`](../../types/interfaces/IndexConfig.md)

Configuration for collision handling

### Returns

Result containing either the index or a DuplicateKeyError

> (`items`): [`Result`](../../../result/types/type-aliases/Result.md)\<`Record`\<`TKey`, `T`\>, [`DuplicateKeyError`](../../types/classes/DuplicateKeyError.md)\>

#### Parameters

##### items

readonly `T`[]

#### Returns

[`Result`](../../../result/types/type-aliases/Result.md)\<`Record`\<`TKey`, `T`\>, [`DuplicateKeyError`](../../types/classes/DuplicateKeyError.md)\>

### Example

```typescript
// Data-first
const users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' }
]

indexByUnique(users, (u) => u.id)
// => Ok({ 1: { id: 1, name: 'Alice' }, 2: { id: 2, name: 'Bob' } })

// Duplicate keys
const duplicates = [
  { id: 1, name: 'Alice' },
  { id: 1, name: 'Alicia' }
]

indexByUnique(duplicates, (u) => u.id)
// => Err(DuplicateKeyError: Duplicate key found: 1)

// Handle collisions with config
indexByUnique(duplicates, (u) => u.id, { onCollision: 'last' })
// => Ok({ 1: { id: 1, name: 'Alicia' } }) // keeps last

indexByUnique(duplicates, (u) => u.id, { onCollision: 'first' })
// => Ok({ 1: { id: 1, name: 'Alice' } }) // keeps first

// Data-last (in pipe)
pipe(
  users,
  indexByUnique((u) => u.id)
)
```

### See

nest - for hierarchical grouping
