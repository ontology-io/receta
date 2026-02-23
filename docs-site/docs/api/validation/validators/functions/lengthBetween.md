# Function: lengthBetween()

> **lengthBetween**(`min`, `max`, `errorMessage?`): [`Validator`](../../types/type-aliases/Validator.md)\<`string`, `string`, `string`\>

Defined in: [validation/validators/index.ts:84](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/validation/validators/index.ts#L84)

Validates string length within a range.

## Parameters

### min

`number`

Minimum length

### max

`number`

Maximum length

### errorMessage?

`string`

Custom error message (optional)

## Returns

[`Validator`](../../types/type-aliases/Validator.md)\<`string`, `string`, `string`\>

Validator that checks length range

## Example

```typescript
lengthBetween(3, 10)('John') // => Valid('John')
lengthBetween(3, 10)('Jo') // => Invalid(['Must be between 3 and 10 characters'])
lengthBetween(3, 10)('Very long name') // => Invalid(['Must be between 3 and 10 characters'])
```
