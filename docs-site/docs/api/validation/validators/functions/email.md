# Function: email()

> **email**(`errorMessage?`): [`Validator`](../../types/type-aliases/Validator.md)\<`string`, `string`, `string`\>

Defined in: [validation/validators/index.ts:130](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/validation/validators/index.ts#L130)

Validates email address format.

Uses a simple but effective regex pattern for email validation.

## Parameters

### errorMessage?

`string`

Custom error message (optional)

## Returns

[`Validator`](../../types/type-aliases/Validator.md)\<`string`, `string`, `string`\>

Validator that checks email format

## Example

```typescript
email()('john@example.com') // => Valid('john@example.com')
email()('invalid-email') // => Invalid(['Invalid email address'])
email('Bad email')('invalid') // => Invalid(['Bad email'])
```
