# Function: positive()

> **positive**(`errorMessage?`): [`Validator`](../../types/type-aliases/Validator.md)\<`number`, `number`, `string`\>

Defined in: [validation/validators/index.ts:254](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/validation/validators/index.ts#L254)

Validates number is positive (> 0).

## Parameters

### errorMessage?

`string`

Custom error message (optional)

## Returns

[`Validator`](../../types/type-aliases/Validator.md)\<`number`, `number`, `string`\>

Validator that checks positive value

## Example

```typescript
positive()(5) // => Valid(5)
positive()(0) // => Invalid(['Must be positive'])
positive()(-1) // => Invalid(['Must be positive'])
```
