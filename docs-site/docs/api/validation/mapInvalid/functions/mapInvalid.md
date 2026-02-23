# Function: mapInvalid()

## Call Signature

> **mapInvalid**\<`T`, `E`, `F`\>(`validation`, `fn`): [`Validation`](../../types/type-aliases/Validation.md)\<`T`, `F`\>

Defined in: [validation/mapInvalid/index.ts:60](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/validation/mapInvalid/index.ts#L60)

Maps over the Invalid errors of a Validation.

If the validation is Invalid, applies the function to each error.
If the validation is Valid, returns it unchanged.

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

The validation to map over

#### fn

(`error`) => `F`

Function to transform each error

### Returns

[`Validation`](../../types/type-aliases/Validation.md)\<`T`, `F`\>

A new validation with transformed errors

### Example

```typescript
// Data-first
mapInvalid(invalid(['error1', 'error2']), e => e.toUpperCase())
// => Invalid(['ERROR1', 'ERROR2'])

mapInvalid(valid(42), e => e.toUpperCase())
// => Valid(42)

// Data-last (in pipe)
pipe(
  invalid(['error1', 'error2']),
  mapInvalid(e => e.toUpperCase())
) // => Invalid(['ERROR1', 'ERROR2'])

// Real-world: Add context to errors
const validateForm = (data: FormData) =>
  pipe(
    validateEmail(data.email),
    mapInvalid(err => ({ field: 'email', message: err }))
  )

// Transform error types
const toApiError = (err: string): ApiError => ({
  code: 'VALIDATION_ERROR',
  message: err,
  timestamp: Date.now()
})

pipe(
  validateInput(input),
  mapInvalid(toApiError)
)
```

### See

 - map - for transforming valid values
 - flatMap - for chaining validations

## Call Signature

> **mapInvalid**\<`E`, `F`\>(`fn`): \<`T`\>(`validation`) => [`Validation`](../../types/type-aliases/Validation.md)\<`T`, `F`\>

Defined in: [validation/mapInvalid/index.ts:64](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/validation/mapInvalid/index.ts#L64)

Maps over the Invalid errors of a Validation.

If the validation is Invalid, applies the function to each error.
If the validation is Valid, returns it unchanged.

### Type Parameters

#### E

`E`

#### F

`F`

### Parameters

#### fn

(`error`) => `F`

Function to transform each error

### Returns

A new validation with transformed errors

> \<`T`\>(`validation`): [`Validation`](../../types/type-aliases/Validation.md)\<`T`, `F`\>

#### Type Parameters

##### T

`T`

#### Parameters

##### validation

[`Validation`](../../types/type-aliases/Validation.md)\<`T`, `E`\>

#### Returns

[`Validation`](../../types/type-aliases/Validation.md)\<`T`, `F`\>

### Example

```typescript
// Data-first
mapInvalid(invalid(['error1', 'error2']), e => e.toUpperCase())
// => Invalid(['ERROR1', 'ERROR2'])

mapInvalid(valid(42), e => e.toUpperCase())
// => Valid(42)

// Data-last (in pipe)
pipe(
  invalid(['error1', 'error2']),
  mapInvalid(e => e.toUpperCase())
) // => Invalid(['ERROR1', 'ERROR2'])

// Real-world: Add context to errors
const validateForm = (data: FormData) =>
  pipe(
    validateEmail(data.email),
    mapInvalid(err => ({ field: 'email', message: err }))
  )

// Transform error types
const toApiError = (err: string): ApiError => ({
  code: 'VALIDATION_ERROR',
  message: err,
  timestamp: Date.now()
})

pipe(
  validateInput(input),
  mapInvalid(toApiError)
)
```

### See

 - map - for transforming valid values
 - flatMap - for chaining validations
