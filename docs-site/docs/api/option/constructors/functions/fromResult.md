# Function: fromResult()

> **fromResult**\<`T`, `E`\>(`result`): [`Option`](../../types/type-aliases/Option.md)\<`T`\>

Defined in: [option/constructors/index.ts:76](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/option/constructors/index.ts#L76)

Converts a Result to an Option, discarding the error.

If the Result is Ok, returns Some with the value.
If the Result is Err, returns None.

## Type Parameters

### T

`T`

### E

`E`

## Parameters

### result

[`Result`](../../../result/types/type-aliases/Result.md)\<`T`, `E`\>

The Result to convert

## Returns

[`Option`](../../types/type-aliases/Option.md)\<`T`\>

Option containing the Ok value or None

## Example

```typescript
// When you don't care about the specific error
const maybeNumber = fromResult(parseNumber(str))
// Ok(42) => Some(42)
// Err('Invalid') => None
```
