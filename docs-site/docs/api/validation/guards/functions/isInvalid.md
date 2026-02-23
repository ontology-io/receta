# Function: isInvalid()

> **isInvalid**\<`T`, `E`\>(`validation`): `validation is Invalid<E>`

Defined in: [validation/guards/index.ts:68](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/validation/guards/index.ts#L68)

Type guard to check if a Validation is Invalid.

Narrows the type to Invalid<E>, allowing safe access to the errors.

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

`validation is Invalid<E>`

True if the validation is Invalid

## Example

```typescript
const result = invalid(['Name required', 'Email invalid'])

if (isInvalid(result)) {
  console.log(result.errors) // TypeScript knows this is safe
  // => ['Name required', 'Email invalid']
}

// Real-world: Error handling
const validation = validateForm(formData)
if (isInvalid(validation)) {
  validation.errors.forEach(err => displayError(err))
  return
}
processForm(validation.value)
```

## See

isValid - for checking if validation succeeded
