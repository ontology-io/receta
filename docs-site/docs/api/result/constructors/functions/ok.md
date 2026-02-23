# Function: ok()

> **ok**\<`T`\>(`value`): [`Ok`](../../types/interfaces/Ok.md)\<`T`\>

Defined in: [result/constructors/index.ts:15](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/result/constructors/index.ts#L15)

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
