# Function: nest()

## Call Signature

> **nest**\<`T`\>(`items`, `keys`): [`NestedMap`](../../types/type-aliases/NestedMap.md)\<`T`\>

Defined in: [collection/nest/index.ts:42](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/collection/nest/index.ts#L42)

Groups items hierarchically by multiple keys, creating a nested structure.

Useful for organizing data like comments grouped by user and post,
or products grouped by category and subcategory.

### Type Parameters

#### T

`T`

### Parameters

#### items

readonly `T`[]

The array of items to nest

#### keys

readonly (keyof `T` \| (`item`) => `string` \| `number`)[]

Array of key selectors (property names or functions)

### Returns

[`NestedMap`](../../types/type-aliases/NestedMap.md)\<`T`\>

A nested map structure

### Example

```typescript
// Data-first
const comments = [
  { userId: 1, postId: 10, text: 'Hello' },
  { userId: 1, postId: 10, text: 'World' },
  { userId: 2, postId: 20, text: 'Foo' }
]

nest(comments, ['userId', 'postId'])
// => {
//   1: {
//     10: [{ userId: 1, postId: 10, text: 'Hello' }, { userId: 1, postId: 10, text: 'World' }]
//   },
//   2: {
//     20: [{ userId: 2, postId: 20, text: 'Foo' }]
//   }
// }

// Data-last (in pipe)
pipe(
  comments,
  nest(['userId', 'postId'])
)
```

### See

groupByPath - for grouping by a single nested path

## Call Signature

> **nest**\<`T`\>(`keys`): (`items`) => [`NestedMap`](../../types/type-aliases/NestedMap.md)\<`T`\>

Defined in: [collection/nest/index.ts:46](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/collection/nest/index.ts#L46)

Groups items hierarchically by multiple keys, creating a nested structure.

Useful for organizing data like comments grouped by user and post,
or products grouped by category and subcategory.

### Type Parameters

#### T

`T`

### Parameters

#### keys

readonly (keyof `T` \| (`item`) => `string` \| `number`)[]

Array of key selectors (property names or functions)

### Returns

A nested map structure

> (`items`): [`NestedMap`](../../types/type-aliases/NestedMap.md)\<`T`\>

#### Parameters

##### items

readonly `T`[]

#### Returns

[`NestedMap`](../../types/type-aliases/NestedMap.md)\<`T`\>

### Example

```typescript
// Data-first
const comments = [
  { userId: 1, postId: 10, text: 'Hello' },
  { userId: 1, postId: 10, text: 'World' },
  { userId: 2, postId: 20, text: 'Foo' }
]

nest(comments, ['userId', 'postId'])
// => {
//   1: {
//     10: [{ userId: 1, postId: 10, text: 'Hello' }, { userId: 1, postId: 10, text: 'World' }]
//   },
//   2: {
//     20: [{ userId: 2, postId: 20, text: 'Foo' }]
//   }
// }

// Data-last (in pipe)
pipe(
  comments,
  nest(['userId', 'postId'])
)
```

### See

groupByPath - for grouping by a single nested path
