# Function: max()

> **max**(`maximum`, `errorMessage?`): [`Validator`](../../types/type-aliases/Validator.md)\<`number`, `number`, `string`\>

Defined in: [validation/validators/index.ts:213](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/validation/validators/index.ts#L213)

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
