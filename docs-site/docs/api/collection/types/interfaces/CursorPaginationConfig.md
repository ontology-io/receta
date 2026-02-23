# Interface: CursorPaginationConfig\<TCursor\>

Defined in: [collection/types.ts:66](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/collection/types.ts#L66)

Cursor-based pagination configuration.

## Example

```typescript
const config: CursorPaginationConfig<string> = {
  cursor: 'user_123',
  limit: 20
}
```

## Type Parameters

### TCursor

`TCursor`

## Properties

### cursor?

> `readonly` `optional` **cursor**: `TCursor`

Defined in: [collection/types.ts:67](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/collection/types.ts#L67)

***

### limit

> `readonly` **limit**: `number`

Defined in: [collection/types.ts:68](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/collection/types.ts#L68)
