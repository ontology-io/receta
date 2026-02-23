# Interface: CursorPaginatedResult\<T, TCursor\>

Defined in: [collection/types.ts:112](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/collection/types.ts#L112)

Result of a cursor-based pagination operation.

## Example

```typescript
const page: CursorPaginatedResult<User, string> = {
  items: users,
  nextCursor: 'user_456',
  hasMore: true
}
```

## Type Parameters

### T

`T`

The type of items in the page

### TCursor

`TCursor`

The type of the cursor

## Properties

### hasMore

> `readonly` **hasMore**: `boolean`

Defined in: [collection/types.ts:115](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/collection/types.ts#L115)

***

### items

> `readonly` **items**: readonly `T`[]

Defined in: [collection/types.ts:113](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/collection/types.ts#L113)

***

### nextCursor?

> `readonly` `optional` **nextCursor**: `TCursor`

Defined in: [collection/types.ts:114](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/collection/types.ts#L114)
