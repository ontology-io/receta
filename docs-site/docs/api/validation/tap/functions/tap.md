# Function: tap()

## Call Signature

> **tap**\<`T`, `E`\>(`validation`, `fn`): [`Validation`](../../types/type-aliases/Validation.md)\<`T`, `E`\>

Defined in: [validation/tap/index.ts:71](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/validation/tap/index.ts#L71)

Performs a side effect with the Valid value, returning the validation unchanged.

Useful for logging, debugging, or triggering side effects in a pipeline
without modifying the validation.

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

(`value`) => `void`

Side effect function called with the valid value

### Returns

[`Validation`](../../types/type-aliases/Validation.md)\<`T`, `E`\>

The original validation unchanged

### Example

```typescript
// Data-first
tap(valid(42), (n) => console.log('Value:', n))
// Logs: "Value: 42"
// Returns: Valid(42)

tap(invalid(['error']), (n) => console.log('Value:', n))
// Logs nothing
// Returns: Invalid(['error'])

// Data-last (in pipe)
pipe(
  validateEmail(email),
  tap((email) => console.log('Valid email:', email)),
  flatMap(sendWelcomeEmail)
)

// Real-world: Log valid values
const processUser = (data: unknown) =>
  pipe(
    validateUser(data),
    tap((user) => logger.info('User validated', { userId: user.id })),
    flatMap(saveUser)
  )

// Real-world: Trigger analytics
const submitForm = (formData: FormData) =>
  pipe(
    validateForm(formData),
    tap((data) => analytics.track('form_validated', data)),
    flatMap(sendToAPI)
  )

// Real-world: Debug pipeline
const debug = <T>(label: string) => (value: T) => {
  console.log(label, value)
  return value
}

pipe(
  validateInput(input),
  tap(debug('After validation')),
  map(transform),
  tap(debug('After transform'))
)
```

### See

tapInvalid - for side effects on Invalid

## Call Signature

> **tap**\<`T`\>(`fn`): \<`E`\>(`validation`) => [`Validation`](../../types/type-aliases/Validation.md)\<`T`, `E`\>

Defined in: [validation/tap/index.ts:72](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/validation/tap/index.ts#L72)

Performs a side effect with the Valid value, returning the validation unchanged.

Useful for logging, debugging, or triggering side effects in a pipeline
without modifying the validation.

### Type Parameters

#### T

`T`

### Parameters

#### fn

(`value`) => `void`

Side effect function called with the valid value

### Returns

The original validation unchanged

> \<`E`\>(`validation`): [`Validation`](../../types/type-aliases/Validation.md)\<`T`, `E`\>

#### Type Parameters

##### E

`E`

#### Parameters

##### validation

[`Validation`](../../types/type-aliases/Validation.md)\<`T`, `E`\>

#### Returns

[`Validation`](../../types/type-aliases/Validation.md)\<`T`, `E`\>

### Example

```typescript
// Data-first
tap(valid(42), (n) => console.log('Value:', n))
// Logs: "Value: 42"
// Returns: Valid(42)

tap(invalid(['error']), (n) => console.log('Value:', n))
// Logs nothing
// Returns: Invalid(['error'])

// Data-last (in pipe)
pipe(
  validateEmail(email),
  tap((email) => console.log('Valid email:', email)),
  flatMap(sendWelcomeEmail)
)

// Real-world: Log valid values
const processUser = (data: unknown) =>
  pipe(
    validateUser(data),
    tap((user) => logger.info('User validated', { userId: user.id })),
    flatMap(saveUser)
  )

// Real-world: Trigger analytics
const submitForm = (formData: FormData) =>
  pipe(
    validateForm(formData),
    tap((data) => analytics.track('form_validated', data)),
    flatMap(sendToAPI)
  )

// Real-world: Debug pipeline
const debug = <T>(label: string) => (value: T) => {
  console.log(label, value)
  return value
}

pipe(
  validateInput(input),
  tap(debug('After validation')),
  map(transform),
  tap(debug('After transform'))
)
```

### See

tapInvalid - for side effects on Invalid
