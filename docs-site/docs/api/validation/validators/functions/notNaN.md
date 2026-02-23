# Function: notNaN()

> **notNaN**(`errorMessage?`): [`Validator`](../../types/type-aliases/Validator.md)\<`number`, `number`, `string`\>

Defined in: [validation/validators/index.ts:300](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/validation/validators/index.ts#L300)

Validates number is not NaN.

## Parameters

### errorMessage?

`string`

Custom error message (optional)

## Returns

[`Validator`](../../types/type-aliases/Validator.md)\<`number`, `number`, `string`\>

Validator that checks for valid number

## Example

```typescript
notNaN()(42) // => Valid(42)
notNaN()(NaN) // => Invalid(['Must be a valid number'])
```
