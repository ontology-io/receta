# Function: isSome()

> **isSome**\<`T`\>(`option`): `option is Some<T>`

Defined in: [option/guards/index.ts:20](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/option/guards/index.ts#L20)

Type guard to check if an Option is Some.

Narrows the type to Some<T>.

## Type Parameters

### T

`T`

## Parameters

### option

[`Option`](../../types/type-aliases/Option.md)\<`T`\>

The Option to check

## Returns

`option is Some<T>`

True if the Option is Some

## Example

```typescript
const opt = some(42)

if (isSome(opt)) {
  console.log(opt.value) // TypeScript knows this is safe
}
```
