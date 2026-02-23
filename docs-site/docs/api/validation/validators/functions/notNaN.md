# Function: notNaN()

> **notNaN**(`errorMessage?`): [`Validator`](../../types/type-aliases/Validator.md)\<`number`, `number`, `string`\>

Defined in: [validation/validators/index.ts:300](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/validation/validators/index.ts#L300)

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
