# Function: tapInvalid()

## Call Signature

> **tapInvalid**\<`T`, `E`\>(`validation`, `fn`): [`Validation`](../../types/type-aliases/Validation.md)\<`T`, `E`\>

Defined in: [validation/tap/index.ts:153](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/validation/tap/index.ts#L153)

Performs a side effect with the Invalid errors, returning the validation unchanged.

Useful for logging errors, sending error reports, or triggering error handling
side effects without modifying the validation.

### Type Parameters

#### T

`T`

#### E

`E`

### Parameters

#### validation

[`Validation`](../../types/type-aliases/Validation.md)\<`T`, `E`\>

The validation to tap

#### fn

(`errors`) => `void`

Side effect function called with the errors

### Returns

[`Validation`](../../types/type-aliases/Validation.md)\<`T`, `E`\>

The original validation unchanged

### Example

```typescript
// Data-first
tapInvalid(invalid(['error1', 'error2']), (errors) => console.error(errors))
// Logs: ['error1', 'error2']
// Returns: Invalid(['error1', 'error2'])

tapInvalid(valid(42), (errors) => console.error(errors))
// Logs nothing
// Returns: Valid(42)

// Data-last (in pipe)
pipe(
  validateForm(formData),
  tapInvalid((errors) => logger.error('Validation failed', { errors })),
  match({
    onValid: processForm,
    onInvalid: () => showErrorPage()
  })
)

// Real-world: Error reporting
const processWithErrorReporting = (data: unknown) =>
  pipe(
    validateData(data),
    tapInvalid((errors) => {
      errorTracker.report('validation_error', {
        errors,
        context: { data }
      })
    }),
    flatMap(process)
  )

// Real-world: User feedback
const submitForm = (formData: FormData) =>
  pipe(
    validateForm(formData),
    tapInvalid((errors) => {
      showToast({
        type: 'error',
        message: `Please fix ${errors.length} error(s)`
      })
    }),
    flatMap(sendToAPI)
  )

// Real-world: Combined logging
const processWithLogging = (data: unknown) =>
  pipe(
    validateData(data),
    tap((valid) => logger.info('Validation passed', { data: valid })),
    tapInvalid((errors) => logger.error('Validation failed', { errors })),
    flatMap(process)
  )
```

### See

tap - for side effects on Valid

## Call Signature

> **tapInvalid**\<`E`\>(`fn`): \<`T`\>(`validation`) => [`Validation`](../../types/type-aliases/Validation.md)\<`T`, `E`\>

Defined in: [validation/tap/index.ts:157](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/validation/tap/index.ts#L157)

Performs a side effect with the Invalid errors, returning the validation unchanged.

Useful for logging errors, sending error reports, or triggering error handling
side effects without modifying the validation.

### Type Parameters

#### E

`E`

### Parameters

#### fn

(`errors`) => `void`

Side effect function called with the errors

### Returns

The original validation unchanged

> \<`T`\>(`validation`): [`Validation`](../../types/type-aliases/Validation.md)\<`T`, `E`\>

#### Type Parameters

##### T

`T`

#### Parameters

##### validation

[`Validation`](../../types/type-aliases/Validation.md)\<`T`, `E`\>

#### Returns

[`Validation`](../../types/type-aliases/Validation.md)\<`T`, `E`\>

### Example

```typescript
// Data-first
tapInvalid(invalid(['error1', 'error2']), (errors) => console.error(errors))
// Logs: ['error1', 'error2']
// Returns: Invalid(['error1', 'error2'])

tapInvalid(valid(42), (errors) => console.error(errors))
// Logs nothing
// Returns: Valid(42)

// Data-last (in pipe)
pipe(
  validateForm(formData),
  tapInvalid((errors) => logger.error('Validation failed', { errors })),
  match({
    onValid: processForm,
    onInvalid: () => showErrorPage()
  })
)

// Real-world: Error reporting
const processWithErrorReporting = (data: unknown) =>
  pipe(
    validateData(data),
    tapInvalid((errors) => {
      errorTracker.report('validation_error', {
        errors,
        context: { data }
      })
    }),
    flatMap(process)
  )

// Real-world: User feedback
const submitForm = (formData: FormData) =>
  pipe(
    validateForm(formData),
    tapInvalid((errors) => {
      showToast({
        type: 'error',
        message: `Please fix ${errors.length} error(s)`
      })
    }),
    flatMap(sendToAPI)
  )

// Real-world: Combined logging
const processWithLogging = (data: unknown) =>
  pipe(
    validateData(data),
    tap((valid) => logger.info('Validation passed', { data: valid })),
    tapInvalid((errors) => logger.error('Validation failed', { errors })),
    flatMap(process)
  )
```

### See

tap - for side effects on Valid
