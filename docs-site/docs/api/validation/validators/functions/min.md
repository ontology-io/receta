# Function: min()

> **min**(`minimum`, `errorMessage?`): [`Validator`](../../types/type-aliases/Validator.md)\<`number`, `number`, `string`\>

Defined in: [validation/validators/index.ts:197](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/validation/validators/index.ts#L197)

Validates number is greater than or equal to minimum.

## Parameters

### minimum

`number`

Minimum value (inclusive)

### errorMessage?

`string`

Custom error message (optional)

## Returns

[`Validator`](../../types/type-aliases/Validator.md)\<`number`, `number`, `string`\>

Validator that checks minimum value

## Example

```typescript
min(0)(5) // => Valid(5)
min(0)(-1) // => Invalid(['Must be at least 0'])
min(18, 'Must be adult')(17) // => Invalid(['Must be adult'])
```
