# Function: some()

> **some**\<`T`\>(`value`): [`Some`](../../types/interfaces/Some.md)\<`T`\>

Defined in: [option/constructors/index.ts:17](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/option/constructors/index.ts#L17)

Creates a Some Option containing a value.

## Type Parameters

### T

`T`

## Parameters

### value

`T`

The value to wrap

## Returns

[`Some`](../../types/interfaces/Some.md)\<`T`\>

A Some Option containing the value

## Example

```typescript
const result = some(42)
// => { _tag: 'Some', value: 42 }
```
