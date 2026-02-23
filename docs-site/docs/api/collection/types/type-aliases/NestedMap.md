# Type Alias: NestedMap\<T\>

> **NestedMap**\<`T`\> = `object`

Defined in: [collection/types.ts:149](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/collection/types.ts#L149)

A nested map structure for hierarchical grouping.

## Type Parameters

### T

`T`

## Index Signature

\[`key`: `string` \| `number`\]: `T` \| `NestedMap`\<`T`\> \| readonly `T`[]

## Example

```typescript
const nested: NestedMap<Comment> = {
  'user_1': {
    'post_1': [comment1, comment2],
    'post_2': [comment3]
  }
}
```
