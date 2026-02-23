# Function: ok()

> **ok**\<`T`\>(`value`): [`Ok`](../../types/interfaces/Ok.md)\<`T`\>

Defined in: [result/constructors/index.ts:15](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/result/constructors/index.ts#L15)

Creates a successful Result containing a value.

## Type Parameters

### T

`T`

## Parameters

### value

`T`

The success value

## Returns

[`Ok`](../../types/interfaces/Ok.md)\<`T`\>

An Ok Result containing the value

## Example

```typescript
const result = ok(42)
// => { _tag: 'Ok', value: 42 }
```
