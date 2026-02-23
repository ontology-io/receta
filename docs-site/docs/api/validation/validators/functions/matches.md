# Function: matches()

> **matches**(`pattern`, `errorMessage`): [`Validator`](../../types/type-aliases/Validator.md)\<`string`, `string`, `string`\>

Defined in: [validation/validators/index.ts:110](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/validation/validators/index.ts#L110)

Validates string matches a regex pattern.

## Parameters

### pattern

`RegExp`

Regex pattern to match

### errorMessage

`string`

Custom error message

## Returns

[`Validator`](../../types/type-aliases/Validator.md)\<`string`, `string`, `string`\>

Validator that checks regex match

## Example

```typescript
matches(/^[A-Z]/, 'Must start with uppercase')('John') // => Valid('John')
matches(/^[A-Z]/, 'Must start with uppercase')('john') // => Invalid(['Must start with uppercase'])

// Username validation
matches(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores')
```
