# Function: minItems()

> **minItems**\<`T`\>(`minCount`, `errorMessage?`): [`Validator`](../../types/type-aliases/Validator.md)\<`T`[], `T`[], `string`\>

Defined in: [validation/validators/index.ts:351](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/validation/validators/index.ts#L351)

Validates array has minimum length.

## Type Parameters

### T

`T`

## Parameters

### minCount

`number`

Minimum number of elements

### errorMessage?

`string`

Custom error message (optional)

## Returns

[`Validator`](../../types/type-aliases/Validator.md)\<`T`[], `T`[], `string`\>

Validator that checks minimum array length

## Example

```typescript
minItems(2)([1, 2, 3]) // => Valid([1, 2, 3])
minItems(2)([1]) // => Invalid(['Must have at least 2 items'])
```
