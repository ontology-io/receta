# Interface: NestConfig\<T\>

Defined in: [collection/types.ts:131](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/collection/types.ts#L131)

Configuration for nested grouping operations.

## Example

```typescript
const config: NestConfig<Comment> = {
  by: ['userId', 'postId'],
  createEmpty: () => []
}
```

## Type Parameters

### T

`T`

The type of items being grouped

## Properties

### by

> `readonly` **by**: readonly (keyof `T` \| (`item`) => `string` \| `number`)[]

Defined in: [collection/types.ts:132](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/collection/types.ts#L132)

***

### createEmpty()?

> `readonly` `optional` **createEmpty**: () => `unknown`

Defined in: [collection/types.ts:133](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/collection/types.ts#L133)

#### Returns

`unknown`
