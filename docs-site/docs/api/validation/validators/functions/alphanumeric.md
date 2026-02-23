# Function: alphanumeric()

> **alphanumeric**(`errorMessage?`): [`Validator`](../../types/type-aliases/Validator.md)\<`string`, `string`, `string`\>

Defined in: [validation/validators/index.ts:173](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/validation/validators/index.ts#L173)

Validates string contains only alphanumeric characters.

## Parameters

### errorMessage?

`string`

Custom error message (optional)

## Returns

[`Validator`](../../types/type-aliases/Validator.md)\<`string`, `string`, `string`\>

Validator that checks alphanumeric characters

## Example

```typescript
alphanumeric()('John123') // => Valid('John123')
alphanumeric()('John@123') // => Invalid(['Must contain only letters and numbers'])
```
