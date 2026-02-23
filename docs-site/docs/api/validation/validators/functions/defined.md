# Function: defined()

> **defined**\<`T`\>(`errorMessage`): [`Validator`](../../types/type-aliases/Validator.md)\<`T` \| `null` \| `undefined`, `T`, `string`\>

Defined in: [validation/validators/index.ts:438](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/validation/validators/index.ts#L438)

Validates value is not null or undefined.

## Type Parameters

### T

`T`

## Parameters

### errorMessage

`string`

Custom error message

## Returns

[`Validator`](../../types/type-aliases/Validator.md)\<`T` \| `null` \| `undefined`, `T`, `string`\>

Validator that checks for defined value

## Example

```typescript
defined('Value required')(42) // => Valid(42)
defined('Value required')(null) // => Invalid(['Value required'])
defined('Value required')(undefined) // => Invalid(['Value required'])
```
