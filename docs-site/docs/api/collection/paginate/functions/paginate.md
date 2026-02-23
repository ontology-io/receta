# Function: paginate()

## Call Signature

> **paginate**\<`T`\>(`items`, `config`): [`PaginatedResult`](../../types/interfaces/PaginatedResult.md)\<`T`\>

Defined in: [collection/paginate/index.ts:42](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/collection/paginate/index.ts#L42)

Paginates an array using offset-based pagination.

Useful for implementing API pagination, infinite scroll, and data tables.

### Type Parameters

#### T

`T`

### Parameters

#### items

readonly `T`[]

The array to paginate

#### config

[`PaginationConfig`](../../types/interfaces/PaginationConfig.md)

Pagination configuration (page and pageSize)

### Returns

[`PaginatedResult`](../../types/interfaces/PaginatedResult.md)\<`T`\>

A PaginatedResult with items and metadata

### Example

```typescript
// Data-first
const users = Array.from({ length: 100 }, (_, i) => ({ id: i }))

paginate(users, { page: 1, pageSize: 20 })
// => {
//   items: [first 20 users],
//   page: 1,
//   pageSize: 20,
//   total: 100,
//   hasNext: true,
//   hasPrevious: false
// }

// Data-last (in pipe)
pipe(
  users,
  paginate({ page: 2, pageSize: 20 })
)
```

### See

paginateCursor - for cursor-based pagination

## Call Signature

> **paginate**\<`T`\>(`config`): (`items`) => [`PaginatedResult`](../../types/interfaces/PaginatedResult.md)\<`T`\>

Defined in: [collection/paginate/index.ts:46](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/collection/paginate/index.ts#L46)

Paginates an array using offset-based pagination.

Useful for implementing API pagination, infinite scroll, and data tables.

### Type Parameters

#### T

`T`

### Parameters

#### config

[`PaginationConfig`](../../types/interfaces/PaginationConfig.md)

Pagination configuration (page and pageSize)

### Returns

A PaginatedResult with items and metadata

> (`items`): [`PaginatedResult`](../../types/interfaces/PaginatedResult.md)\<`T`\>

#### Parameters

##### items

readonly `T`[]

#### Returns

[`PaginatedResult`](../../types/interfaces/PaginatedResult.md)\<`T`\>

### Example

```typescript
// Data-first
const users = Array.from({ length: 100 }, (_, i) => ({ id: i }))

paginate(users, { page: 1, pageSize: 20 })
// => {
//   items: [first 20 users],
//   page: 1,
//   pageSize: 20,
//   total: 100,
//   hasNext: true,
//   hasPrevious: false
// }

// Data-last (in pipe)
pipe(
  users,
  paginate({ page: 2, pageSize: 20 })
)
```

### See

paginateCursor - for cursor-based pagination
