# Function: isErr()

> **isErr**\<`T`, `E`\>(`result`): `result is Err<E>`

Defined in: [result/guards/index.ts:41](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/result/guards/index.ts#L41)

Type guard to check if a Result is Err.

Narrows the type to Err<E>, allowing safe access to the error property.

## Type Parameters

### T

`T`

### E

`E`

## Parameters

### result

[`Result`](../../types/type-aliases/Result.md)\<`T`, `E`\>

The Result to check

## Returns

`result is Err<E>`

True if the Result is Err, false otherwise

## Example

```typescript
const result: Result<number, string> = err('Failed')

if (isErr(result)) {
  console.log(result.error) // TypeScript knows this is safe
}
```
