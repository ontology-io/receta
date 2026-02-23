# Function: valid()

> **valid**\<`T`\>(`value`): [`Valid`](../../types/interfaces/Valid.md)\<`T`\>

Defined in: [validation/constructors/index.ts:27](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/validation/constructors/index.ts#L27)

Creates a Valid validation containing a value.

## Type Parameters

### T

`T`

## Parameters

### value

`T`

The value to wrap

## Returns

[`Valid`](../../types/interfaces/Valid.md)\<`T`\>

A Valid validation containing the value

## Example

```typescript
const result = valid(42)
// => { _tag: 'Valid', value: 42 }

const user = valid({ name: 'John', email: 'john@example.com' })
// => { _tag: 'Valid', value: { name: 'John', email: 'john@example.com' } }
```
