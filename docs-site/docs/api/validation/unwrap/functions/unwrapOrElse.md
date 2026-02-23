# Function: unwrapOrElse()

## Call Signature

> **unwrapOrElse**\<`T`, `E`\>(`validation`, `fn`): `T`

Defined in: [validation/unwrap/index.ts:151](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/validation/unwrap/index.ts#L151)

Extracts the value from a Valid validation or computes a default from errors.

### Type Parameters

#### T

`T`

#### E

`E`

### Parameters

#### validation

[`Validation`](../../types/type-aliases/Validation.md)\<`T`, `E`\>

The validation to unwrap

#### fn

(`errors`) => `T`

Function that takes errors and returns a default value

### Returns

`T`

The value from Valid, or the computed default

### Example

```typescript
// Data-first
unwrapOrElse(valid(42), () => 0)
// => 42

unwrapOrElse(invalid(['error1', 'error2']), (errors) => {
  console.error('Validation failed:', errors)
  return 0
})
// Logs errors and returns 0

// Data-last (in pipe)
pipe(
  validateInput(input),
  unwrapOrElse((errors) => {
    reportErrors(errors)
    return fallbackValue
  })
)

// Real-world: Log errors and return default
const getConfig = (raw: unknown) =>
  pipe(
    validateConfig(raw),
    unwrapOrElse((errors) => {
      logger.error('Config validation failed', { errors })
      return defaultConfig
    })
  )

// Real-world: Create error report
const processForm = (data: FormData) =>
  pipe(
    validateForm(data),
    unwrapOrElse((errors) => {
      showNotification({
        type: 'error',
        message: `Validation failed with ${errors.length} errors`
      })
      return emptyForm
    })
  )
```

### See

 - unwrapOr - for a static default value
 - match - for comprehensive error handling

## Call Signature

> **unwrapOrElse**\<`T`, `E`\>(`fn`): (`validation`) => `T`

Defined in: [validation/unwrap/index.ts:155](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/validation/unwrap/index.ts#L155)

Extracts the value from a Valid validation or computes a default from errors.

### Type Parameters

#### T

`T`

#### E

`E`

### Parameters

#### fn

(`errors`) => `T`

Function that takes errors and returns a default value

### Returns

The value from Valid, or the computed default

> (`validation`): `T`

#### Parameters

##### validation

[`Validation`](../../types/type-aliases/Validation.md)\<`T`, `E`\>

#### Returns

`T`

### Example

```typescript
// Data-first
unwrapOrElse(valid(42), () => 0)
// => 42

unwrapOrElse(invalid(['error1', 'error2']), (errors) => {
  console.error('Validation failed:', errors)
  return 0
})
// Logs errors and returns 0

// Data-last (in pipe)
pipe(
  validateInput(input),
  unwrapOrElse((errors) => {
    reportErrors(errors)
    return fallbackValue
  })
)

// Real-world: Log errors and return default
const getConfig = (raw: unknown) =>
  pipe(
    validateConfig(raw),
    unwrapOrElse((errors) => {
      logger.error('Config validation failed', { errors })
      return defaultConfig
    })
  )

// Real-world: Create error report
const processForm = (data: FormData) =>
  pipe(
    validateForm(data),
    unwrapOrElse((errors) => {
      showNotification({
        type: 'error',
        message: `Validation failed with ${errors.length} errors`
      })
      return emptyForm
    })
  )
```

### See

 - unwrapOr - for a static default value
 - match - for comprehensive error handling
