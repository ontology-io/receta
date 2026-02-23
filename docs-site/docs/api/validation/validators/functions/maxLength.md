# Function: maxLength()

> **maxLength**(`max`, `errorMessage?`): [`Validator`](../../types/type-aliases/Validator.md)\<`string`, `string`, `string`\>

Defined in: [validation/validators/index.ts:63](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/validation/validators/index.ts#L63)

Validates maximum string length.

## Parameters

### max

`number`

Maximum length

### errorMessage?

`string`

Custom error message (optional)

## Returns

[`Validator`](../../types/type-aliases/Validator.md)\<`string`, `string`, `string`\>

Validator that checks maximum length

## Example

```typescript
maxLength(10)('John') // => Valid('John')
maxLength(10)('Very long name') // => Invalid(['Must be at most 10 characters'])
```
