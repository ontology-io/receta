# Function: between()

> **between**(`minimum`, `maximum`, `errorMessage?`): [`Validator`](../../types/type-aliases/Validator.md)\<`number`, `number`, `string`\>

Defined in: [validation/validators/index.ts:231](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/validation/validators/index.ts#L231)

Validates number is within a range.

## Parameters

### minimum

`number`

Minimum value (inclusive)

### maximum

`number`

Maximum value (inclusive)

### errorMessage?

`string`

Custom error message (optional)

## Returns

[`Validator`](../../types/type-aliases/Validator.md)\<`number`, `number`, `string`\>

Validator that checks range

## Example

```typescript
between(0, 100)(50) // => Valid(50)
between(0, 100)(-1) // => Invalid(['Must be between 0 and 100'])
between(0, 100)(150) // => Invalid(['Must be between 0 and 100'])
```
