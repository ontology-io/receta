# Function: equals()

> **equals**\<`T`\>(`expected`, `errorMessage?`): [`Validator`](../../types/type-aliases/Validator.md)\<`T`, `T`, `string`\>

Defined in: [validation/validators/index.ts:422](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/validation/validators/index.ts#L422)

Validates value equals expected value.

## Type Parameters

### T

`T`

## Parameters

### expected

`T`

Expected value

### errorMessage?

`string`

Custom error message (optional)

## Returns

[`Validator`](../../types/type-aliases/Validator.md)\<`T`, `T`, `string`\>

Validator that checks equality

## Example

```typescript
equals('yes')('yes') // => Valid('yes')
equals('yes')('no') // => Invalid(['Must equal: yes'])

// Useful for checkbox confirmations
equals(true, 'You must agree')
```
