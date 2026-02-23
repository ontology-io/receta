# Interface: PaginatedResult\<T\>

Defined in: [collection/types.ts:88](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/collection/types.ts#L88)

Result of a pagination operation.

## Example

```typescript
const page: PaginatedResult<User> = {
  items: users,
  page: 1,
  pageSize: 20,
  total: 100,
  hasNext: true,
  hasPrevious: false
}
```

## Type Parameters

### T

`T`

The type of items in the page

## Properties

### hasNext

> `readonly` **hasNext**: `boolean`

Defined in: [collection/types.ts:93](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/collection/types.ts#L93)

***

### hasPrevious

> `readonly` **hasPrevious**: `boolean`

Defined in: [collection/types.ts:94](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/collection/types.ts#L94)

***

### items

> `readonly` **items**: readonly `T`[]

Defined in: [collection/types.ts:89](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/collection/types.ts#L89)

***

### page

> `readonly` **page**: `number`

Defined in: [collection/types.ts:90](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/collection/types.ts#L90)

***

### pageSize

> `readonly` **pageSize**: `number`

Defined in: [collection/types.ts:91](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/collection/types.ts#L91)

***

### total

> `readonly` **total**: `number`

Defined in: [collection/types.ts:92](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/collection/types.ts#L92)
