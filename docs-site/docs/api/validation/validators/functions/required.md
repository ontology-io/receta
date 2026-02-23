# Function: required()

> **required**(`errorMessage`): [`Validator`](../../types/type-aliases/Validator.md)\<`string`, `string`, `string`\>

Defined in: [validation/validators/index.ts:27](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/validation/validators/index.ts#L27)

Validates that a string is not empty.

## Parameters

### errorMessage

`string`

Custom error message

## Returns

[`Validator`](../../types/type-aliases/Validator.md)\<`string`, `string`, `string`\>

Validator that checks for non-empty strings

## Example

```typescript
required('Name is required')('John') // => Valid('John')
required('Name is required')('') // => Invalid(['Name is required'])
required('Name is required')('  ') // => Invalid(['Name is required']) (whitespace only)
```
