# Function: unwrap()

> **unwrap**\<`T`, `E`\>(`validation`): `T`

Defined in: [validation/unwrap/index.ts:40](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/validation/unwrap/index.ts#L40)

Extracts the value from a Valid validation or throws an error.

⚠️ **Warning**: This function throws if the validation is Invalid.
Only use when you're certain the validation is Valid, or use unwrapOr/unwrapOrElse instead.

## Type Parameters

### T

`T`

### E

`E`

## Parameters

### validation

[`Validation`](../../types/type-aliases/Validation.md)\<`T`, `E`\>

The validation to unwrap

## Returns

`T`

The value from Valid

## Throws

If the validation is Invalid

## Example

```typescript
unwrap(valid(42)) // => 42

unwrap(invalid(['error']))
// => throws Error: "Cannot unwrap Invalid validation"

// Real-world: When you've already checked the validation
const validation = validateConfig(config)
if (isValid(validation)) {
  const value = unwrap(validation) // Safe because we checked
  useConfig(value)
}
```

## See

 - unwrapOr - for providing a default value
 - unwrapOrElse - for computing a default value
 - match - for safe pattern matching
