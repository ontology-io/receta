# Function: minLength()

> **minLength**(`min`, `errorMessage?`): [`Validator`](../../types/type-aliases/Validator.md)\<`string`, `string`, `string`\>

Defined in: [validation/validators/index.ts:44](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/validation/validators/index.ts#L44)

Validates minimum string length.

## Parameters

### min

`number`

Minimum length

### errorMessage?

`string`

Custom error message (optional)

## Returns

[`Validator`](../../types/type-aliases/Validator.md)\<`string`, `string`, `string`\>

Validator that checks minimum length

## Example

```typescript
minLength(3)('John') // => Valid('John')
minLength(3)('Jo') // => Invalid(['Must be at least 3 characters'])
minLength(3, 'Too short')('Jo') // => Invalid(['Too short'])
```
