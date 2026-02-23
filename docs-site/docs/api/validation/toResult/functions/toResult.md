# Function: toResult()

## Call Signature

> **toResult**\<`T`, `E`\>(`validation`): [`Result`](../../../result/types/type-aliases/Result.md)\<`T`, readonly `E`[]\>

Defined in: [validation/toResult/index.ts:62](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/validation/toResult/index.ts#L62)

Converts a Validation to a Result.

Valid becomes Ok, Invalid becomes Err with the array of errors.

⚠️ **Note**: This loses the error accumulation capability of Validation.
Result only holds a single error value (which will be the array of all errors).

### Type Parameters

#### T

`T`

#### E

`E`

### Parameters

#### validation

[`Validation`](../../types/type-aliases/Validation.md)\<`T`, `E`\>

The Validation to convert

### Returns

[`Result`](../../../result/types/type-aliases/Result.md)\<`T`, readonly `E`[]\>

A Result with the value or errors array

### Example

```typescript
// Data-first
toResult(valid(42))
// => Ok(42)

toResult(invalid(['error1', 'error2']))
// => Err(['error1', 'error2'])

// Data-last (in pipe)
pipe(
  validateEmail(email),
  toResult
)

// Real-world: Convert to Result for API that expects Result
const validateForAPI = (data: unknown) =>
  pipe(
    validateData(data),
    toResult,
    Result.mapErr((errors) => ({
      code: 'VALIDATION_ERROR',
      messages: errors
    }))
  )

// Real-world: Use Result's error handling
const process = (input: unknown) =>
  pipe(
    validateInput(input),
    toResult,
    Result.flatMap(processValidData),
    Result.unwrapOr(defaultValue)
  )
```

### See

fromResult - for converting Result to Validation

## Call Signature

> **toResult**\<`T`, `E`\>(): (`validation`) => [`Result`](../../../result/types/type-aliases/Result.md)\<`T`, readonly `E`[]\>

Defined in: [validation/toResult/index.ts:63](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/validation/toResult/index.ts#L63)

Converts a Validation to a Result.

Valid becomes Ok, Invalid becomes Err with the array of errors.

⚠️ **Note**: This loses the error accumulation capability of Validation.
Result only holds a single error value (which will be the array of all errors).

### Type Parameters

#### T

`T`

#### E

`E`

### Returns

A Result with the value or errors array

> (`validation`): [`Result`](../../../result/types/type-aliases/Result.md)\<`T`, readonly `E`[]\>

#### Parameters

##### validation

[`Validation`](../../types/type-aliases/Validation.md)\<`T`, `E`\>

#### Returns

[`Result`](../../../result/types/type-aliases/Result.md)\<`T`, readonly `E`[]\>

### Example

```typescript
// Data-first
toResult(valid(42))
// => Ok(42)

toResult(invalid(['error1', 'error2']))
// => Err(['error1', 'error2'])

// Data-last (in pipe)
pipe(
  validateEmail(email),
  toResult
)

// Real-world: Convert to Result for API that expects Result
const validateForAPI = (data: unknown) =>
  pipe(
    validateData(data),
    toResult,
    Result.mapErr((errors) => ({
      code: 'VALIDATION_ERROR',
      messages: errors
    }))
  )

// Real-world: Use Result's error handling
const process = (input: unknown) =>
  pipe(
    validateInput(input),
    toResult,
    Result.flatMap(processValidData),
    Result.unwrapOr(defaultValue)
  )
```

### See

fromResult - for converting Result to Validation
