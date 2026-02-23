# Function: max()

> **max**(`maximum`, `errorMessage?`): [`Validator`](../../types/type-aliases/Validator.md)\<`number`, `number`, `string`\>

Defined in: [validation/validators/index.ts:213](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/validation/validators/index.ts#L213)

Validates number is less than or equal to maximum.

## Parameters

### maximum

`number`

Maximum value (inclusive)

### errorMessage?

`string`

Custom error message (optional)

## Returns

[`Validator`](../../types/type-aliases/Validator.md)\<`number`, `number`, `string`\>

Validator that checks maximum value

## Example

```typescript
max(100)(50) // => Valid(50)
max(100)(150) // => Invalid(['Must be at most 100'])
```
