# Function: isOk()

> **isOk**\<`T`, `E`\>(`result`): `result is Ok<T>`

Defined in: [result/guards/index.ts:20](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/result/guards/index.ts#L20)

Type guard to check if a Result is Ok.

Narrows the type to Ok<T>, allowing safe access to the value property.

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

`result is Ok<T>`

True if the Result is Ok, false otherwise

## Example

```typescript
const result: Result<number, string> = ok(42)

if (isOk(result)) {
  console.log(result.value) // TypeScript knows this is safe
}
```
