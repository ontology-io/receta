# Function: nonEmpty()

> **nonEmpty**\<`T`\>(`errorMessage`): [`Validator`](../../types/type-aliases/Validator.md)\<`T`[], `T`[], `string`\>

Defined in: [validation/validators/index.ts:335](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/validation/validators/index.ts#L335)

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
