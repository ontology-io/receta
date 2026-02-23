# Function: finite()

> **finite**(`errorMessage?`): [`Validator`](../../types/type-aliases/Validator.md)\<`number`, `number`, `string`\>

Defined in: [validation/validators/index.ts:316](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/validation/validators/index.ts#L316)

Validates number is finite (not Infinity or -Infinity).

## Parameters

### errorMessage?

`string`

Custom error message (optional)

## Returns

[`Validator`](../../types/type-aliases/Validator.md)\<`number`, `number`, `string`\>

Validator that checks for finite number

## Example

```typescript
finite()(42) // => Valid(42)
finite()(Infinity) // => Invalid(['Must be a finite number'])
finite()(-Infinity) // => Invalid(['Must be a finite number'])
```
