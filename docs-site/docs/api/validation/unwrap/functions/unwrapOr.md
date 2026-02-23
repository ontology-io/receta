# Function: unwrapOr()

## Call Signature

> **unwrapOr**\<`T`, `E`\>(`validation`, `defaultValue`): `T`

Defined in: [validation/unwrap/index.ts:86](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/validation/unwrap/index.ts#L86)

Extracts the value from a Valid validation or returns a default value.

### Type Parameters

#### T

`T`

#### E

`E`

### Parameters

#### validation

[`Validation`](../../types/type-aliases/Validation.md)\<`T`, `E`\>

The validation to unwrap

#### defaultValue

`T`

Value to return if validation is Invalid

### Returns

`T`

The value from Valid, or the default value

### Example

```typescript
// Data-first
unwrapOr(valid(42), 0) // => 42
unwrapOr(invalid(['error']), 0) // => 0

// Data-last (in pipe)
pipe(
  validateAge(input),
  unwrapOr(18)
)

// Real-world: Configuration with defaults
const getPort = (config: Config) =>
  pipe(
    validatePort(config.port),
    unwrapOr(3000)
  )

// Form field with default
const getUsername = (form: FormData) =>
  pipe(
    validateUsername(form.username),
    unwrapOr('anonymous')
  )
```

### See

 - unwrapOrElse - for computing the default value
 - unwrap - for throwing on Invalid

## Call Signature

> **unwrapOr**\<`T`\>(`defaultValue`): \<`E`\>(`validation`) => `T`

Defined in: [validation/unwrap/index.ts:87](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/validation/unwrap/index.ts#L87)

Extracts the value from a Valid validation or returns a default value.

### Type Parameters

#### T

`T`

### Parameters

#### defaultValue

`T`

Value to return if validation is Invalid

### Returns

The value from Valid, or the default value

> \<`E`\>(`validation`): `T`

#### Type Parameters

##### E

`E`

#### Parameters

##### validation

[`Validation`](../../types/type-aliases/Validation.md)\<`T`, `E`\>

#### Returns

`T`

### Example

```typescript
// Data-first
unwrapOr(valid(42), 0) // => 42
unwrapOr(invalid(['error']), 0) // => 0

// Data-last (in pipe)
pipe(
  validateAge(input),
  unwrapOr(18)
)

// Real-world: Configuration with defaults
const getPort = (config: Config) =>
  pipe(
    validatePort(config.port),
    unwrapOr(3000)
  )

// Form field with default
const getUsername = (form: FormData) =>
  pipe(
    validateUsername(form.username),
    unwrapOr('anonymous')
  )
```

### See

 - unwrapOrElse - for computing the default value
 - unwrap - for throwing on Invalid
