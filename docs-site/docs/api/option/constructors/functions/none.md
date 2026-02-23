# Function: none()

> **none**\<`T`\>(): [`None`](../../types/interfaces/None.md)

Defined in: [option/constructors/index.ts:32](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/option/constructors/index.ts#L32)

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
