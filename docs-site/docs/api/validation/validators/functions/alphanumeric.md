# Function: alphanumeric()

> **alphanumeric**(`errorMessage?`): [`Validator`](../../types/type-aliases/Validator.md)\<`string`, `string`, `string`\>

Defined in: [validation/validators/index.ts:173](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/validation/validators/index.ts#L173)

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
