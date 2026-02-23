# Function: toResultWith()

## Call Signature

> **toResultWith**\<`T`, `E`, `F`\>(`validation`, `combineErrors`): [`Result`](../../../result/types/type-aliases/Result.md)\<`T`, `F`\>

Defined in: [validation/toResult/index.ts:118](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/validation/toResult/index.ts#L118)

Converts a Validation to a Result, combining all errors into a single error.

Like toResult, but uses a function to combine multiple errors into a single error.
This is useful when you need a Result with a single error value instead of an array.

### Type Parameters

#### T

`T`

#### E

`E`

#### F

`F`

### Parameters

#### validation

[`Validation`](../../types/type-aliases/Validation.md)\<`T`, `E`\>

The Validation to convert

#### combineErrors

(`errors`) => `F`

Function to combine errors array into single error

### Returns

[`Result`](../../../result/types/type-aliases/Result.md)\<`T`, `F`\>

A Result with the value or combined error

### Example

```typescript
// Combine errors into a message
toResultWith(
  invalid(['Error 1', 'Error 2', 'Error 3']),
  (errors) => errors.join('; ')
)
// => Err('Error 1; Error 2; Error 3')

// Use first error only
toResultWith(
  invalid(['Error 1', 'Error 2']),
  (errors) => errors[0] ?? 'Unknown error'
)
// => Err('Error 1')

// Real-world: Create structured error
const toApiResult = (validation: Validation<User, string>) =>
  toResultWith(validation, (errors) => ({
    status: 400,
    code: 'VALIDATION_ERROR',
    message: 'Validation failed',
    details: errors
  }))

// Real-world: Format for display
const toDisplayResult = (validation: Validation<Data, FieldError>) =>
  toResultWith(validation, (errors) => ({
    title: 'Please fix the following errors:',
    items: errors.map(e => `${e.field}: ${e.errors.join(', ')}`)
  }))
```

### See

 - toResult - for keeping errors as array
 - fromResult - for converting Result to Validation

## Call Signature

> **toResultWith**\<`E`, `F`\>(`combineErrors`): \<`T`\>(`validation`) => [`Result`](../../../result/types/type-aliases/Result.md)\<`T`, `F`\>

Defined in: [validation/toResult/index.ts:122](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/validation/toResult/index.ts#L122)

Converts a Validation to a Result, combining all errors into a single error.

Like toResult, but uses a function to combine multiple errors into a single error.
This is useful when you need a Result with a single error value instead of an array.

### Type Parameters

#### E

`E`

#### F

`F`

### Parameters

#### combineErrors

(`errors`) => `F`

Function to combine errors array into single error

### Returns

A Result with the value or combined error

> \<`T`\>(`validation`): [`Result`](../../../result/types/type-aliases/Result.md)\<`T`, `F`\>

#### Type Parameters

##### T

`T`

#### Parameters

##### validation

[`Validation`](../../types/type-aliases/Validation.md)\<`T`, `E`\>

#### Returns

[`Result`](../../../result/types/type-aliases/Result.md)\<`T`, `F`\>

### Example

```typescript
// Combine errors into a message
toResultWith(
  invalid(['Error 1', 'Error 2', 'Error 3']),
  (errors) => errors.join('; ')
)
// => Err('Error 1; Error 2; Error 3')

// Use first error only
toResultWith(
  invalid(['Error 1', 'Error 2']),
  (errors) => errors[0] ?? 'Unknown error'
)
// => Err('Error 1')

// Real-world: Create structured error
const toApiResult = (validation: Validation<User, string>) =>
  toResultWith(validation, (errors) => ({
    status: 400,
    code: 'VALIDATION_ERROR',
    message: 'Validation failed',
    details: errors
  }))

// Real-world: Format for display
const toDisplayResult = (validation: Validation<Data, FieldError>) =>
  toResultWith(validation, (errors) => ({
    title: 'Please fix the following errors:',
    items: errors.map(e => `${e.field}: ${e.errors.join(', ')}`)
  }))
```

### See

 - toResult - for keeping errors as array
 - fromResult - for converting Result to Validation
