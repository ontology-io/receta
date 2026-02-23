# Function: isValid()

> **isValid**\<`T`, `E`\>(`validation`): `validation is Valid<T>`

Defined in: [validation/guards/index.ts:36](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/validation/guards/index.ts#L36)

Type guard to check if a Validation is Valid.

Narrows the type to Valid<T>, allowing safe access to the value.

## Type Parameters

### T

`T`

### E

`E`

## Parameters

### validation

[`Validation`](../../types/type-aliases/Validation.md)\<`T`, `E`\>

The validation to check

## Returns

`validation is Valid<T>`

True if the validation is Valid

## Example

```typescript
const result = valid(42)

if (isValid(result)) {
  console.log(result.value) // TypeScript knows this is safe: 42
}

// Real-world: Conditional logic based on validation
const validation = validateEmail(email)
if (isValid(validation)) {
  await sendEmail(validation.value)
} else {
  showErrors(validation.errors)
}
```

## See

isInvalid - for checking if validation failed
