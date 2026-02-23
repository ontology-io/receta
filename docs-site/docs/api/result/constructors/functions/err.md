# Function: err()

> **err**\<`E`\>(`error`): [`Err`](../../types/interfaces/Err.md)\<`E`\>

Defined in: [result/constructors/index.ts:31](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/result/constructors/index.ts#L31)

Creates a failed Result containing an error.

## Type Parameters

### E

`E`

## Parameters

### error

`E`

The error value

## Returns

[`Err`](../../types/interfaces/Err.md)\<`E`\>

An Err Result containing the error

## Example

```typescript
const result = err('Something went wrong')
// => { _tag: 'Err', error: 'Something went wrong' }
```
