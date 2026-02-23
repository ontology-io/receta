# Function: nonEmpty()

> **nonEmpty**\<`T`\>(`errorMessage`): [`Validator`](../../types/type-aliases/Validator.md)\<`T`[], `T`[], `string`\>

Defined in: [validation/validators/index.ts:335](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/validation/validators/index.ts#L335)

Validates array is not empty.

## Type Parameters

### T

`T`

## Parameters

### errorMessage

`string`

Custom error message

## Returns

[`Validator`](../../types/type-aliases/Validator.md)\<`T`[], `T`[], `string`\>

Validator that checks non-empty array

## Example

```typescript
nonEmpty('List cannot be empty')([1, 2, 3]) // => Valid([1, 2, 3])
nonEmpty('List cannot be empty')([]) // => Invalid(['List cannot be empty'])
```
