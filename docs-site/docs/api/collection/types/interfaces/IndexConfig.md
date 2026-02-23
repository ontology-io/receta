# Interface: IndexConfig

Defined in: [collection/types.ts:165](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/collection/types.ts#L165)

Configuration for index operations with collision handling.

## Type Param

The type of items being indexed

## Example

```typescript
const config: IndexConfig<User> = {
  onCollision: 'error' // or 'first' | 'last'
}
```

## Properties

### onCollision?

> `readonly` `optional` **onCollision**: `"error"` \| `"first"` \| `"last"`

Defined in: [collection/types.ts:166](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/collection/types.ts#L166)
