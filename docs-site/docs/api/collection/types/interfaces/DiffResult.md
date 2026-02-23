# Interface: DiffResult\<T\>

Defined in: [collection/types.ts:22](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/collection/types.ts#L22)

Result of a diff operation showing added, updated, and removed items.

## Example

```typescript
const result: DiffResult<User> = {
  added: [newUser],
  updated: [{ old: oldUser, new: updatedUser }],
  removed: [deletedUser],
  unchanged: [sameUser]
}
```

## Type Parameters

### T

`T`

The type of items in the collection

## Properties

### added

> `readonly` **added**: readonly `T`[]

Defined in: [collection/types.ts:23](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/collection/types.ts#L23)

***

### removed

> `readonly` **removed**: readonly `T`[]

Defined in: [collection/types.ts:25](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/collection/types.ts#L25)

***

### unchanged

> `readonly` **unchanged**: readonly `T`[]

Defined in: [collection/types.ts:26](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/collection/types.ts#L26)

***

### updated

> `readonly` **updated**: readonly [`UpdatedItem`](UpdatedItem.md)\<`T`\>[]

Defined in: [collection/types.ts:24](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/collection/types.ts#L24)
