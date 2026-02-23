# Function: none()

> **none**\<`T`\>(): [`None`](../../types/interfaces/None.md)

Defined in: [option/constructors/index.ts:32](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/option/constructors/index.ts#L32)

Creates a None Option representing absence of a value.

## Type Parameters

### T

`T` = `never`

## Returns

[`None`](../../types/interfaces/None.md)

A None Option

## Example

```typescript
const result = none()
// => { _tag: 'None' }
```
