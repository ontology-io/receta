# Function: paginateCursor()

## Call Signature

> **paginateCursor**\<`T`, `TCursor`\>(`items`, `getCursor`, `config`): [`CursorPaginatedResult`](../../types/interfaces/CursorPaginatedResult.md)\<`T`, `TCursor`\>

Defined in: [collection/paginate/index.ts:112](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/collection/paginate/index.ts#L112)

Paginates an array using cursor-based pagination.

More efficient than offset pagination for large datasets and real-time data.
Prevents issues with missing/duplicate items during pagination.

### Type Parameters

#### T

`T`

#### TCursor

`TCursor`

### Parameters

#### items

readonly `T`[]

The array to paginate

#### getCursor

(`item`) => `TCursor`

Function to extract cursor from item

#### config

[`CursorPaginationConfig`](../../types/interfaces/CursorPaginationConfig.md)\<`TCursor`\>

Cursor pagination configuration

### Returns

[`CursorPaginatedResult`](../../types/interfaces/CursorPaginatedResult.md)\<`T`, `TCursor`\>

A CursorPaginatedResult with items and next cursor

### Example

```typescript
// Data-first
const messages = [
  { id: 'msg_1', text: 'Hello', createdAt: '2024-01-01' },
  { id: 'msg_2', text: 'World', createdAt: '2024-01-02' }
]

paginateCursor(messages, (m) => m.id, { limit: 10 })
// => {
//   items: [first 10 messages],
//   nextCursor: 'msg_10',
//   hasMore: true
// }

// Continue from cursor
paginateCursor(messages, (m) => m.id, { cursor: 'msg_10', limit: 10 })

// Data-last (in pipe)
pipe(
  messages,
  paginateCursor((m) => m.id, { limit: 10 })
)
```

### See

paginate - for offset-based pagination

## Call Signature

> **paginateCursor**\<`T`, `TCursor`\>(`getCursor`, `config`): (`items`) => [`CursorPaginatedResult`](../../types/interfaces/CursorPaginatedResult.md)\<`T`, `TCursor`\>

Defined in: [collection/paginate/index.ts:117](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/collection/paginate/index.ts#L117)

Paginates an array using cursor-based pagination.

More efficient than offset pagination for large datasets and real-time data.
Prevents issues with missing/duplicate items during pagination.

### Type Parameters

#### T

`T`

#### TCursor

`TCursor`

### Parameters

#### getCursor

(`item`) => `TCursor`

Function to extract cursor from item

#### config

[`CursorPaginationConfig`](../../types/interfaces/CursorPaginationConfig.md)\<`TCursor`\>

Cursor pagination configuration

### Returns

A CursorPaginatedResult with items and next cursor

> (`items`): [`CursorPaginatedResult`](../../types/interfaces/CursorPaginatedResult.md)\<`T`, `TCursor`\>

#### Parameters

##### items

readonly `T`[]

#### Returns

[`CursorPaginatedResult`](../../types/interfaces/CursorPaginatedResult.md)\<`T`, `TCursor`\>

### Example

```typescript
// Data-first
const messages = [
  { id: 'msg_1', text: 'Hello', createdAt: '2024-01-01' },
  { id: 'msg_2', text: 'World', createdAt: '2024-01-02' }
]

paginateCursor(messages, (m) => m.id, { limit: 10 })
// => {
//   items: [first 10 messages],
//   nextCursor: 'msg_10',
//   hasMore: true
// }

// Continue from cursor
paginateCursor(messages, (m) => m.id, { cursor: 'msg_10', limit: 10 })

// Data-last (in pipe)
pipe(
  messages,
  paginateCursor((m) => m.id, { limit: 10 })
)
```

### See

paginate - for offset-based pagination
