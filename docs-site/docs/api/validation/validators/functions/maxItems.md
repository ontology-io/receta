# Function: maxItems()

> **maxItems**\<`T`\>(`maxCount`, `errorMessage?`): [`Validator`](../../types/type-aliases/Validator.md)\<`T`[], `T`[], `string`\>

Defined in: [validation/validators/index.ts:370](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/validation/validators/index.ts#L370)

Validates array has maximum length.

## Type Parameters

### T

`T`

## Parameters

### maxCount

`number`

Maximum number of elements

### errorMessage?

`string`

Custom error message (optional)

## Returns

[`Validator`](../../types/type-aliases/Validator.md)\<`T`[], `T`[], `string`\>

Validator that checks maximum array length

## Example

```typescript
maxItems(5)([1, 2, 3]) // => Valid([1, 2, 3])
maxItems(2)([1, 2, 3]) // => Invalid(['Must have at most 2 items'])
```
