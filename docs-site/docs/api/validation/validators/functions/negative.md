# Function: negative()

> **negative**(`errorMessage?`): [`Validator`](../../types/type-aliases/Validator.md)\<`number`, `number`, `string`\>

Defined in: [validation/validators/index.ts:270](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/validation/validators/index.ts#L270)

Validates number is negative (< 0).

## Parameters

### errorMessage?

`string`

Custom error message (optional)

## Returns

[`Validator`](../../types/type-aliases/Validator.md)\<`number`, `number`, `string`\>

Validator that checks negative value

## Example

```typescript
negative()(-5) // => Valid(-5)
negative()(0) // => Invalid(['Must be negative'])
negative()(1) // => Invalid(['Must be negative'])
```
